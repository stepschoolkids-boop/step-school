"""Yangilik manbalari — RSS va rasmiy sahifalarni o'qish, mavzu bo'yicha filtrlash."""
import asyncio
import hashlib
import logging
import re
import ssl
from datetime import datetime, timedelta, timezone

import feedparser
import httpx

from . import db

log = logging.getLogger(__name__)

# Standart manbalar — bot birinchi ishga tushganda bazaga yoziladi.
# kind="page" — rasmiy sahifa, har safar o'qiladi (yangilik emas, ma'lumotnoma).
# kind="rss"  — yangiliklar lentasi.
DEFAULT_FEEDS = [
    # --- Rasmiy, eng ishonchli ---
    ("https://uzbmb.uz/page/cefr", "page", "UZBMB — Milliy sertifikat (rasmiy)"),
    ("https://uzbmb.uz/", "page", "UZBMB — bosh sahifa yangiliklari"),
    ("https://news.google.com/rss/search?q=site:uzbmb.uz&hl=uz&gl=UZ&ceid=UZ:uz",
     "rss", "Google News — uzbmb.uz"),
    # --- CEFR metodikasi bo'yicha xalqaro manbalar ---
    ("https://www.cambridgeenglish.org/rss/news/", "rss", "Cambridge English"),
    ("https://www.britishcouncil.org/rss.xml", "rss", "British Council"),
    # --- Umumiy qidiruv ---
    ("https://news.google.com/rss/search?q=%22multilevel%22+OR+%22CEFR%22+ingliz+tili+imtihon&hl=uz&gl=UZ&ceid=UZ:uz",
     "rss", "Google News — multilevel (uz)"),
    ("https://news.google.com/rss/search?q=%22milliy+sertifikat%22+ingliz+tili&hl=uz&gl=UZ&ceid=UZ:uz",
     "rss", "Google News — milliy sertifikat"),
    ("https://news.google.com/rss/search?q=CEFR+exam+OR+%22multilevel+exam%22+Uzbekistan&hl=en-US&gl=US&ceid=US:en",
     "rss", "Google News — CEFR (en)"),
]

# Mavzuga tegishlilik uchun kalit so'zlar
KEYWORDS = [
    "cefr", "multilevel", "multi-level", "milliy sertifikat", "ingliz tili",
    "english", "ielts", "toefl", "cambridge", "b1", "b2", "c1", "a2",
    "listening", "reading", "writing", "speaking", "grammar", "vocabulary",
    "imtihon", "exam", "test", "til bilish darajasi", "language proficiency",
    "uzbmb", "dtm", "sertifikat",
]

HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; StepMultilevelBot/1.0)"}


async def ensure_default_sources() -> None:
    """Standart manbalarni FAQAT bir marta qo'shadi.
    Admin /manba_ochir bilan o'chirgan manba qayta tirilib qolmasligi kerak."""
    seeded = set(await db.get_setting("seeded_sources", []) or [])
    existing = {r["url"] for r in await db.list_sources(only_enabled=False)}
    added = 0
    for url, kind, label in DEFAULT_FEEDS:
        if url in seeded or url in existing:
            seeded.add(url)
            continue
        await db.add_source(url, kind, label)
        seeded.add(url)
        added += 1
    await db.set_setting("seeded_sources", sorted(seeded))
    if added:
        log.info("Standart manbalar qo'shildi: %d ta", added)


def _clean(raw: str) -> str:
    txt = re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>", " ", raw or "")
    txt = re.sub(r"<[^>]+>", " ", txt)
    txt = (txt.replace("&nbsp;", " ").replace("&amp;", "&")
              .replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", '"'))
    return re.sub(r"\s+", " ", txt).strip()


def _fingerprint(title: str, link: str) -> str:
    return hashlib.sha256(f"{title.strip().lower()}|{link.strip()}".encode()).hexdigest()[:32]


def _is_relevant(text: str) -> bool:
    low = text.lower()
    return any(k in low for k in KEYWORDS)


async def _get(client: httpx.AsyncClient, insecure: httpx.AsyncClient,
               url: str, label: str):
    """Oddiy so'rov; SSL sertifikat xatosi bo'lsa — tekshiruvsiz qayta urinadi.
    uzbmb.uz kabi ba'zi rasmiy saytlarda sertifikat zanjiri to'liq emas."""
    try:
        r = await client.get(url, follow_redirects=True, timeout=25.0)
        r.raise_for_status()
        return r
    except (ssl.SSLError, httpx.ConnectError, httpx.ReadError):
        # httpx TLS xatolarini ConnectError ichiga o'raydi va xabar matni
        # har xil bo'lishi mumkin — shuning uchun har qanday ulanish
        # xatosida tekshiruvsiz bir marta qayta urinamiz.
        try:
            r = await insecure.get(url, follow_redirects=True, timeout=25.0)
            r.raise_for_status()
            log.info("Manba SSL tekshiruvisiz o'qildi: %s", label or url)
            return r
        except httpx.HTTPError as e2:
            log.warning("Manba o'qilmadi %s: %s", label or url, e2)
            return None
    except httpx.HTTPError as e:
        log.warning("Manba o'qilmadi %s: %s", label or url, e)
        return None


async def _fetch_page(client, insecure, url: str, label: str) -> list[dict]:
    """Rasmiy sahifa — matni ma'lumotnoma sifatida olinadi."""
    r = await _get(client, insecure, url, label)
    if r is None:
        return []

    html_text = r.text
    m = re.search(r"(?is)<title[^>]*>(.*?)</title>", html_text)
    title = _clean(m.group(1)) if m else (label or url)

    body = _clean(html_text)
    if len(body) < 200:
        return []

    return [{
        "title": title[:200],
        "link": url,
        "summary": body[:2500],
        "source": label or url,
        "published": "",
        "kind": "page",
        "fingerprint": _fingerprint(title, url),
    }]


async def _fetch_feed(client, insecure, url: str, label: str) -> list[dict]:
    r = await _get(client, insecure, url, label)
    if r is None:
        return []

    parsed = await asyncio.to_thread(feedparser.parse, r.content)
    cutoff = datetime.now(timezone.utc) - timedelta(days=14)
    items = []
    for e in parsed.entries[:25]:
        title = _clean(getattr(e, "title", ""))
        link = getattr(e, "link", "")
        summary = _clean(getattr(e, "summary", "") or getattr(e, "description", ""))
        if not title:
            continue

        published = None
        for attr in ("published_parsed", "updated_parsed"):
            tt = getattr(e, attr, None)
            if tt:
                try:
                    published = datetime(*tt[:6], tzinfo=timezone.utc)
                except (TypeError, ValueError):
                    published = None
                break
        if published and published < cutoff:
            continue

        if not _is_relevant(f"{title} {summary}"):
            continue

        items.append({
            "title": title,
            "link": link,
            "summary": summary[:600],
            "source": label or url,
            "published": published.isoformat() if published else "",
            "kind": "rss",
            "fingerprint": _fingerprint(title, link),
        })
    return items


async def gather_news(limit: int = 12, skip_seen: bool = True) -> list[dict]:
    """Barcha yoqilgan manbalardan material yig'adi.
    Rasmiy sahifalar (kind='page') har safar qo'shiladi — ular ma'lumotnoma."""
    srcs = await db.list_sources()
    if not srcs:
        return []

    async with httpx.AsyncClient(headers=HEADERS) as client, \
               httpx.AsyncClient(headers=HEADERS, verify=False) as insecure:
        tasks = []
        for s in srcs:
            kind = (s["kind"] or "rss").lower()
            fn = _fetch_page if kind == "page" else _fetch_feed
            tasks.append(fn(client, insecure, s["url"], s["label"] or ""))
        results = await asyncio.gather(*tasks, return_exceptions=True)

    pages: list[dict] = []
    news: list[dict] = []
    for res in results:
        if isinstance(res, Exception):
            log.warning("Manba xatosi: %s", res)
            continue
        for it in res:
            (pages if it.get("kind") == "page" else news).append(it)

    fresh = []
    for it in news:
        if skip_seen and await db.is_seen(it["fingerprint"]):
            continue
        fresh.append(it)
        if len(fresh) >= limit:
            break

    return pages + fresh


def format_for_prompt(items: list[dict]) -> str:
    if not items:
        return "— manbalardan material topilmadi —"
    ref = [i for i in items if i.get("kind") == "page"]
    news = [i for i in items if i.get("kind") != "page"]

    out = []
    if ref:
        out.append("### RASMIY MA'LUMOTNOMA (eng ishonchli manba)")
        for i, it in enumerate(ref, 1):
            out.append(f"{i}. {it['title']}\n   Havola: {it['link']}\n"
                       f"   Matn: {it['summary']}")
    if news:
        out.append("### SO'NGGI YANGILIKLAR")
        for i, it in enumerate(news, 1):
            out.append(f"{i}. {it['title']}\n   Manba: {it['source']}\n"
                       f"   Havola: {it['link']}\n   Mazmun: {it['summary']}")
    return "\n\n".join(out)
