"""Kontent quvuri: qidiruv -> yozish -> sifat nazorati. Postlar matnli."""
import logging
import re
from dataclasses import dataclass, field
from datetime import date

from . import config, db, gemini, prompts, sources

log = logging.getLogger(__name__)

ALLOWED_TAGS = {"b", "strong", "i", "em", "u", "s", "code", "pre", "a"}
# Yopilishi shart bo'lgan teglar (<br> ruxsat etilmaydi — Telegram qo'llamaydi)
PAIRED_TAGS = ("b", "strong", "i", "em", "u", "s", "code", "pre", "a")

_TAG_RE = re.compile(r"</?(?:%s)(?:\s[^<>]*)?/?>" % "|".join(sorted(ALLOWED_TAGS)), re.I)


def _escape_strays(text: str) -> str:
    """Ruxsat etilgan teglardan tashqari barcha < va > ni ekranlaydi.
    Aks holda "ball < 60" kabi oddiy matn Telegram'da parse xatosi beradi."""
    parts, last = [], 0
    for m in _TAG_RE.finditer(text):
        parts.append(text[last:m.start()].replace("<", "&lt;").replace(">", "&gt;"))
        parts.append(m.group(0))
        last = m.end()
    parts.append(text[last:].replace("<", "&lt;").replace(">", "&gt;"))
    return "".join(parts)

SLOT_TYPE_HINT = {
    "ertalab": ("grammatika yoki lug'at", "uz"),
    "tushlik": ("amaliy mashq yoki strategiya", "mixed"),
    "kechqurun": ("chuqur material, namunaviy javob yoki rasmiy yangilik", "uz"),
}


@dataclass
class Draft:
    topic: str
    content_type: str
    body: str
    hashtags: str
    lang: str
    sources: list = field(default_factory=list)
    qc_score: int = 0
    qc_notes: str = ""


# ---------------------------------------------------------------- helpers
def sanitize_html(text: str) -> str:
    """Telegram faqat cheklangan HTML teglarini qabul qiladi.
    Ruxsat etilmagan teglarni olib tashlaymiz, & belgisini ekranlaymiz."""
    if not text:
        return ""
    text = re.sub(r"</?(p|div|span|ul|ol|li|h[1-6])[^>]*>", "\n", text, flags=re.I)
    text = re.sub(r"(?i)<\s*br\s*/?\s*>", "\n", text)

    # markdown qoldiqlarini tozalash
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text, flags=re.S)
    text = re.sub(r"(?<!\w)__(.+?)__(?!\w)", r"<b>\1</b>", text, flags=re.S)

    def keep(m: re.Match) -> str:
        tag = m.group(2).lower()
        return m.group(0) if tag in ALLOWED_TAGS else ""

    text = re.sub(r"<(/?)([a-zA-Z0-9]+)[^>]*>", keep, text)

    # & ni ekranlash (allaqachon ekranlangani tegilmaydi)
    text = re.sub(r"&(?!(amp|lt|gt|quot|#\d+);)", "&amp;", text)
    text = _escape_strays(text)

    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _trim(text: str, limit: int) -> str:
    """Limitdan oshsa — teglarni buzmasdan, gap chegarasida qisqartiradi."""
    if len(text) <= limit:
        return text
    cut = text[:limit]
    # yarim qolgan tegni kesib tashlaymiz
    if cut.rfind("<") > cut.rfind(">"):
        cut = cut[: cut.rfind("<")]
    for sep in ("\n\n", ". ", "! ", "? ", "\n"):
        idx = cut.rfind(sep)
        if idx > limit * 0.6:
            cut = cut[: idx + len(sep)]
            break
    if cut.rfind("<") > cut.rfind(">"):
        cut = cut[: cut.rfind("<")]

    def _closers(t: str) -> str:
        out = ""
        for tag in PAIRED_TAGS:
            missing = (len(re.findall(rf"<{tag}(?:[ >])", t, re.I))
                       - len(re.findall(rf"</{tag}>", t, re.I)))
            out += f"</{tag}>" * max(0, missing)
        return out

    # yopuvchi teglar ham limit ichida qolishi kerak
    for _ in range(5):
        tail = _closers(cut)
        if len(cut) + len(tail) <= limit:
            return (cut.rstrip() + tail)
        cut = cut[: max(0, len(cut) - len(tail) - 16)]
        if cut.rfind("<") > cut.rfind(">"):
            cut = cut[: cut.rfind("<")]
    return (cut + _closers(cut))[:limit]


def _clean_sources(raw, extra: list) -> list:
    """Model havolalarni dict shaklida qaytarishi mumkin — hammasini matnga keltiramiz."""
    out = []
    for item in list(raw or []) + list(extra or []):
        if isinstance(item, str):
            url = item.strip()
        elif isinstance(item, dict):
            url = str(item.get("url") or item.get("link") or item.get("href") or "").strip()
        else:
            url = str(item).strip()
        if url and url not in out:
            out.append(url)
    return out[:8]


def _plain(text: str) -> str:
    """Taqqoslash uchun teglarsiz, bo'shliqlari normallashtirilgan matn."""
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", text or "")).strip()


def compose(body: str, hashtags: str, footer: str = "") -> str:
    """Post matni + hashtaglar + kontakt bloki.
    Kontakt bloki hech qachon qisqartirilmaydi — unga joy oldindan ajratiladi."""
    body = sanitize_html(body)
    tags = (hashtags or "").strip()
    footer = (footer or "").strip()

    # Matnda kontakt allaqachon bo'lsa (masalan qo'lda tahrirlangan) — takrorlamaymiz
    if footer and _plain(footer) and _plain(footer) in _plain(body):
        footer = ""

    tail = ""
    if tags:
        tail += "\n\n" + tags
    if footer:
        tail += "\n\n" + footer

    body = _trim(body, max(200, config.POST_LIMIT - len(tail)))
    return (body + tail).strip()


async def _style_guide() -> str:
    sg = await db.get_setting("style_guide")
    if isinstance(sg, dict):
        sg = sg.get("style_guide")
    return sg or prompts.STYLE_FALLBACK


# ---------------------------------------------------------------- steps
async def research(topic: str) -> tuple[str, list]:
    """1) RSS + 2) Gemini Google Search grounding."""
    rss_items = await sources.gather_news(limit=8)
    rss_block = sources.format_for_prompt(rss_items)

    web_summary, web_sources = "", []
    try:
        data = await gemini.generate_json(
            prompts.research_prompt(topic),
            system=prompts.RESEARCH_SYSTEM,
            temperature=0.3,
            use_search=True,
        )
        if isinstance(data, dict) and data.get("found"):
            web_summary = data.get("summary", "")
            points = data.get("key_points") or []
            if points:
                web_summary += "\n\nAsosiy nuqtalar:\n- " + "\n- ".join(str(p) for p in points)
            ex = data.get("examples") or []
            if ex:
                web_summary += "\n\nMisollar:\n- " + "\n- ".join(str(p) for p in ex)
            mis = data.get("common_mistakes") or []
            if mis:
                web_summary += "\n\nTipik xatolar:\n- " + "\n- ".join(str(p) for p in mis)
            web_sources = [s for s in (data.get("sources") or []) if isinstance(s, str)]
    except Exception as e:  # noqa: BLE001
        log.warning("Internet qidiruvi bo'lmadi: %s", e)

    web_block = web_summary or "— internet qidiruvidan natija yo'q —"
    block = f"[RSS MANBALAR]\n{rss_block}\n\n[INTERNET QIDIRUV]\n{web_block}"
    all_sources = web_sources + [i["link"] for i in rss_items if i.get("link")]

    for it in rss_items:
        await db.mark_seen(it["fingerprint"], it["title"], it["link"])

    return block, all_sources[:8]


async def write_draft(topic: str, content_type: str, lang_hint: str,
                      research_block: str, day_label: str) -> dict:
    return await gemini.generate_json(
        prompts.post_prompt(topic, content_type, lang_hint,
                            await _style_guide(), research_block, day_label),
        system=prompts.SYSTEM,
        temperature=0.85,
    )


async def quality_check(body: str, topic: str, research_block: str) -> dict:
    try:
        return await gemini.generate_json(
            prompts.qc_prompt(body, topic, research_block),
            system=prompts.SYSTEM,
            temperature=0.2,
        )
    except Exception as e:  # noqa: BLE001
        log.warning("QC bajarilmadi: %s", e)
        return {"on_topic": True, "score": 60, "issues": [f"QC ishlamadi: {e}"],
                "fixed_body": body, "verdict": "ok"}


async def build_post(topic: str, content_type: str, slot: str,
                     day_label: str) -> Draft:
    """To'liq quvur: qidiruv -> yozish -> sifat nazorati."""
    hint_type, hint_lang = SLOT_TYPE_HINT.get(slot, ("foydali material", "uz"))
    content_type = content_type or hint_type

    research_block, src_list = await research(topic)
    raw = await write_draft(topic, content_type, hint_lang, research_block, day_label)

    if not isinstance(raw, dict):
        raise RuntimeError("Model kutilgan JSON qaytarmadi")

    body = raw.get("body") or raw.get("text") or ""
    if not body.strip():
        raise RuntimeError("Model bo'sh post qaytardi")

    qc = await quality_check(body, topic, research_block)
    verdict = str(qc.get("verdict", "ok")).lower()

    if verdict == "reject" or not qc.get("on_topic", True):
        raise RuntimeError(
            "Sifat nazorati postni rad etdi: " + "; ".join(map(str, qc.get("issues", [])))[:300]
        )

    final_body = qc.get("fixed_body") or body

    draft = Draft(
        topic=topic,
        content_type=content_type,
        body=compose(final_body, raw.get("hashtags", ""), await db.get_footer()),
        hashtags=raw.get("hashtags", ""),
        lang=raw.get("lang", hint_lang),
        sources=_clean_sources(raw.get("sources"), src_list),
        qc_score=int(qc.get("score") or 0),
        qc_notes="; ".join(map(str, qc.get("issues", [])))[:900],
    )
    return draft


# ---------------------------------------------------------------- planning
async def pick_topic(week_start: date, day_offset: int, slot: str) -> tuple[str, str]:
    """Haftalik rejadan mavzu oladi; reja bo'lmasa — zaxira mavzu generatsiya qiladi."""
    item = await db.take_plan_item(week_start, day_offset, slot)
    if item:
        return item["topic"], item["content_type"]

    log.info("Rejada mavzu yo'q (%s %s) — yangi mavzu generatsiya qilinadi", day_offset, slot)
    recent = await db.recent_published(limit=15)
    recent_txt = "\n".join(f"- {r['topic']}" for r in recent if r["topic"]) or "—"
    hint_type, _ = SLOT_TYPE_HINT.get(slot, ("foydali material", "uz"))
    try:
        data = await gemini.generate_json(
            f"""CEFR Multilevel kanali uchun BITTA yangi post mavzusi o'ylab top.
Slot: {slot} ({hint_type}).
Yaqinda chiqqan mavzular (takrorlama):
{recent_txt}

FAQAT JSON: {{"topic": "aniq mavzu", "content_type": "turi"}}""",
            system=prompts.SYSTEM, temperature=0.9,
        )
        return data["topic"], data.get("content_type", hint_type)
    except Exception as e:  # noqa: BLE001
        log.warning("Zaxira mavzu generatsiyasi bo'lmadi: %s", e)
        return f"CEFR Multilevel: {hint_type}", hint_type


async def generate_week_plan(week_start: date, slots: list[str]) -> list[dict]:
    recent = await db.recent_published(limit=25)
    recent_txt = "\n".join(f"- {r['topic']}" for r in recent if r["topic"])
    week_label = week_start.strftime("%d.%m.%Y") + " dan boshlanuvchi hafta"

    data = await gemini.generate_json(
        prompts.weekly_plan_prompt(slots, week_label, recent_txt),
        system=prompts.SYSTEM, temperature=0.9,
    )
    if isinstance(data, dict):
        data = data.get("plan") or data.get("items") or []

    items = []
    for it in data if isinstance(data, list) else []:
        try:
            slot = str(it["slot"]).strip()
            if slot not in slots:
                continue
            items.append({
                "day_offset": int(it["day_offset"]),
                "slot": slot,
                "topic": str(it["topic"])[:400],
                "content_type": str(it.get("content_type", ""))[:100],
            })
        except (KeyError, TypeError, ValueError):
            continue

    if items:
        await db.save_week_plan(week_start, items)
    return items
