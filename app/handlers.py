"""Telegram bot buyruqlari va tugmalar."""
import html as ihtml
import json
import logging
from datetime import datetime, timedelta

from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.constants import ParseMode
from telegram.error import TelegramError
from telegram.ext import (
    ContextTypes, CommandHandler, CallbackQueryHandler,
    MessageHandler, filters,
)

from . import config, db, gemini, pipeline, prompts

log = logging.getLogger(__name__)

SLOT_EMOJI = {"ertalab": "🌅", "tushlik": "☀️", "kechqurun": "🌙"}
DAYS = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"]


def admin_only(func):
    async def wrapper(update: Update, context: ContextTypes.DEFAULT_TYPE):
        user = update.effective_user
        if not user or user.id != config.ADMIN_CHAT_ID:
            return
        return await func(update, context)
    return wrapper


def approval_keyboard(post_id: int) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("✅ Tasdiqlash", callback_data=f"ok:{post_id}"),
         InlineKeyboardButton("❌ Rad etish", callback_data=f"no:{post_id}")],
        [InlineKeyboardButton("🔄 Qayta generatsiya", callback_data=f"re:{post_id}")],
        [InlineKeyboardButton("🚀 Hozir chiqarish", callback_data=f"go:{post_id}"),
         InlineKeyboardButton("✏️ Matnni tahrirlash", callback_data=f"ed:{post_id}")],
    ])


def preview_caption(post, when: datetime) -> str:
    slot = post["slot"]
    head = (
        f"{SLOT_EMOJI.get(slot, '📌')} <b>{slot.capitalize()} posti</b> — "
        f"{when.strftime('%H:%M')} da chiqadi\n"
        f"🎯 <i>{ihtml.escape(str(post['topic'] or '')[:120])}</i>\n"
        f"✅ Sifat: {post['qc_score']}/100\n"
        f"{'─' * 22}\n\n"
    )
    body = post["body"] or ""
    room = config.POST_LIMIT - len(head) - 40
    if len(body) > room:
        body = pipeline._trim(body, room) + "…"
    return head + body


# ------------------------------------------------------------ commands
@admin_only
async def cmd_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    slots = await db.get_slots()
    times = ", ".join(f"{SLOT_EMOJI.get(k,'•')} {v}" for k, v in slots.items())
    paused = await db.is_paused()
    chan = await db.channel_label()
    await update.message.reply_html(
        f"<b>{config.CHANNEL_NAME} — avtomatik post boti</b>\n\n"
        f"Kanal: {ihtml.escape(chan)}\n"
        f"Post vaqtlari: {times}\n"
        f"Holat: {'⏸ pauza' if paused else '▶️ ishlayapti'}\n\n"
        "<b>Buyruqlar:</b>\n"
        "/kanal — kanalni ulash yoki almashtirish\n"
        "/kontakt — post oxiridagi kontakt bloki\n"
        "/reja — 1 haftalik post mavzulari\n"
        "/reja_yangi — rejani qaytadan tuzish\n"
        "/vaqt — post vaqtlarini ko'rish/o'zgartirish\n"
        "/navbat — navbatdagi postlar\n"
        "/test — hozir sinov posti tayyorlash\n"
        "/manba — yangilik manbalari\n"
        "/uslub — eski postlardan kanal uslubini o'rgatish\n"
        "/pauza — avtomatikani to'xtatish\n"
        "/davom — qayta yoqish\n"
        "/statistika — hisobot\n\n"
        f"Har post chiqishidan <b>{await db.get_setting('lead_minutes', config.DEFAULT_LEAD_MINUTES)} daqiqa</b> "
        "oldin shu yerga tasdiqlash uchun keladi. Javob bermasangiz — avtomatik chiqadi."
    )


@admin_only
async def cmd_plan(update: Update, context: ContextTypes.DEFAULT_TYPE):
    today = datetime.now(config.TZ).date()
    week_start = today - timedelta(days=today.weekday())
    rows = await db.get_week_plan(week_start)
    if not rows:
        await update.message.reply_html(
            "Bu hafta uchun reja hali tuzilmagan.\n/reja_yangi buyrug'i bilan tuzing."
        )
        return

    slots_order = list((await db.get_slots()).keys())
    lines = [f"<b>📅 Haftalik reja</b> ({week_start.strftime('%d.%m')} — "
             f"{(week_start + timedelta(days=6)).strftime('%d.%m.%Y')})\n"]
    for d in range(7):
        day_rows = [r for r in rows if r["day_offset"] == d]
        if not day_rows:
            continue
        mark = " ⬅️ bugun" if d == today.weekday() else ""
        lines.append(f"\n<b>{DAYS[d]}</b>{mark}")
        for slot in slots_order:
            for r in day_rows:
                if r["slot"] != slot:
                    continue
                tick = "✔️" if r["used"] else "▫️"
                lines.append(
                    f"{tick} {SLOT_EMOJI.get(slot,'•')} {ihtml.escape(r['topic'][:90])}"
                )
    chunks, cur = [], ""
    for line in lines:
        if len(cur) + len(line) + 1 > 3500:
            chunks.append(cur)
            cur = ""
        cur += line + "\n"
    if cur.strip():
        chunks.append(cur)
    for chunk in chunks:
        await update.message.reply_html(chunk)


@admin_only
async def cmd_plan_new(update: Update, context: ContextTypes.DEFAULT_TYPE):
    msg = await update.message.reply_html("⏳ Reja tuzilmoqda…")
    today = datetime.now(config.TZ).date()
    week_start = today - timedelta(days=today.weekday())
    slots = list((await db.get_slots()).keys())
    try:
        items = await pipeline.generate_week_plan(week_start, slots)
    except Exception as e:  # noqa: BLE001
        await msg.edit_text(f"❌ Reja tuzilmadi: {e}")
        return
    await msg.edit_text(f"✅ {len(items)} ta mavzu rejaga yozildi. /reja")


@admin_only
async def cmd_times(update: Update, context: ContextTypes.DEFAULT_TYPE):
    slots = await db.get_slots()
    args = context.args or []
    if len(args) == 2:
        name, tm = args[0].lower(), args[1]
        try:
            datetime.strptime(tm, "%H:%M")
        except ValueError:
            await update.message.reply_html("❌ Vaqt formati: <code>08:30</code>")
            return
        if name not in slots:
            await update.message.reply_html(
                f"❌ Noma'lum slot. Mavjud: {', '.join(slots)}"
            )
            return
        slots[name] = tm
        await db.set_slots(slots)
        from . import jobs
        await jobs.reschedule(context.application)
        await update.message.reply_html(f"✅ <b>{name}</b> endi soat <b>{tm}</b> da.")
        return

    lead = await db.get_setting("lead_minutes", config.DEFAULT_LEAD_MINUTES)
    lines = [f"{SLOT_EMOJI.get(k,'•')} <b>{k}</b> — {v}" for k, v in slots.items()]
    await update.message.reply_html(
        "<b>⏰ Post vaqtlari</b>\n" + "\n".join(lines) +
        f"\n\nTasdiqlash: {lead} daqiqa oldin\n\n"
        "O'zgartirish:\n<code>/vaqt ertalab 08:30</code>\n"
        "<code>/vaqt_oldin 15</code>"
    )


@admin_only
async def cmd_lead(update: Update, context: ContextTypes.DEFAULT_TYPE):
    args = context.args or []
    if not args or not args[0].isdigit():
        await update.message.reply_html("Foydalanish: <code>/vaqt_oldin 10</code>")
        return
    minutes = max(2, min(120, int(args[0])))
    await db.set_setting("lead_minutes", minutes)
    from . import jobs
    await jobs.reschedule(context.application)
    await update.message.reply_html(f"✅ Tasdiqlash endi <b>{minutes} daqiqa</b> oldin keladi.")


@admin_only
async def cmd_queue(update: Update, context: ContextTypes.DEFAULT_TYPE):
    rows = await db.upcoming_posts(10)
    if not rows:
        await update.message.reply_html("Navbatda post yo'q.")
        return
    lines = ["<b>📋 Navbatdagi postlar</b>\n"]
    for r in rows:
        when = r["scheduled_at"].astimezone(config.TZ)
        lines.append(
            f"#{r['id']} · {when.strftime('%d.%m %H:%M')} · "
            f"{SLOT_EMOJI.get(r['slot'],'•')} {r['status']}\n"
            f"   <i>{ihtml.escape(str(r['topic'] or '')[:80])}</i>"
        )
    await update.message.reply_html("\n".join(lines))


@admin_only
async def cmd_pause(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await db.set_setting("paused", True)
    await update.message.reply_html("⏸ Avtomatik postlar to'xtatildi. /davom bilan yoqasiz.")


@admin_only
async def cmd_resume(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await db.set_setting("paused", False)
    await update.message.reply_html("▶️ Avtomatik postlar yoqildi.")


@admin_only
async def cmd_stats(update: Update, context: ContextTypes.DEFAULT_TYPE):
    st = await db.stats()
    names = {"published": "✅ Chiqqan", "rejected": "❌ Rad etilgan",
             "pending_approval": "⏳ Tasdiq kutmoqda", "approved": "👍 Tasdiqlangan",
             "failed": "⚠️ Xatolik", "draft": "📝 Qoralama"}
    lines = [f"{names.get(k, k)}: <b>{v}</b>" for k, v in sorted(st.items())]
    await update.message.reply_html("<b>📊 Statistika</b>\n\n" + ("\n".join(lines) or "Ma'lumot yo'q"))


@admin_only
async def cmd_sources(update: Update, context: ContextTypes.DEFAULT_TYPE):
    rows = await db.list_sources(only_enabled=False)
    lines = [f"#{r['id']} {'✅' if r['enabled'] else '🚫'} "
             f"{ihtml.escape(r['label'] or r['url'])[:70]}" for r in rows]
    await update.message.reply_html(
        "<b>🌐 Yangilik manbalari</b>\n\n" + ("\n".join(lines) or "Manba yo'q") +
        "\n\nQo'shish: <code>/manba_qosh https://... Nomi</code>\n"
        "O'chirish: <code>/manba_ochir 3</code>"
    )


@admin_only
async def cmd_source_add(update: Update, context: ContextTypes.DEFAULT_TYPE):
    args = context.args or []
    if not args or not args[0].startswith("http"):
        await update.message.reply_html(
            "Foydalanish:\n"
            "<code>/manba_qosh https://sayt.uz/rss Nomi</code>\n"
            "<code>/manba_qosh https://sayt.uz/sahifa page Nomi</code>\n\n"
            "<b>rss</b> — yangiliklar lentasi (standart)\n"
            "<b>page</b> — rasmiy sahifa, matni ma'lumotnoma sifatida o'qiladi"
        )
        return
    rest = args[1:]
    kind = "rss"
    if rest and rest[0].lower() in ("rss", "page"):
        kind = rest[0].lower()
        rest = rest[1:]
    await db.add_source(args[0], kind, " ".join(rest)[:100])
    await update.message.reply_html(f"✅ Manba qo'shildi (<b>{kind}</b>). /manba")


@admin_only
async def cmd_source_del(update: Update, context: ContextTypes.DEFAULT_TYPE):
    args = context.args or []
    if not args or not args[0].isdigit():
        await update.message.reply_html("Foydalanish: <code>/manba_ochir 3</code>")
        return
    await db.remove_source(int(args[0]))
    await update.message.reply_html("🗑 O'chirildi. /manba")


@admin_only
async def cmd_style(update: Update, context: ContextTypes.DEFAULT_TYPE):
    sg = await db.get_setting("style_guide")
    current = ""
    if sg:
        guide = sg.get("style_guide") if isinstance(sg, dict) else sg
        current = f"\n\n<b>Hozirgi uslub:</b>\n<i>{ihtml.escape(str(guide)[:800])}</i>"
    await update.message.reply_html(
        "<b>🎨 Kanal uslubini o'rgatish</b>\n\n"
        "Telegram Desktop dasturida:\n"
        "1. Kanalni oching\n"
        "2. Yuqori o'ngda <b>⋮</b> → <b>Export chat history</b>\n"
        "3. Format: <b>JSON</b>, Photos — belgilash shart emas\n"
        "4. Yuklab olingan <code>result.json</code> faylini shu yerga tashlang\n\n"
        "Men avvalgi postlaringizni tahlil qilib, yangi postlarni "
        "aynan shu uslubda yozaman." + current
    )


@admin_only
async def on_document(update: Update, context: ContextTypes.DEFAULT_TYPE):
    doc = update.message.document
    if not doc or not (doc.file_name or "").lower().endswith(".json"):
        return
    msg = await update.message.reply_html("⏳ Fayl o'qilmoqda…")
    try:
        f = await doc.get_file()
        raw = bytes(await f.download_as_bytearray())
        data = json.loads(raw.decode("utf-8", errors="replace"))
    except (TelegramError, json.JSONDecodeError, UnicodeDecodeError, OSError) as e:
        await msg.edit_text(f"❌ Fayl o'qilmadi: {e}")
        return

    texts = _extract_export_texts(data)
    if len(texts) < 3:
        await msg.edit_text("❌ Faylda yetarli post topilmadi. Telegram JSON eksporti ekaniga ishonch hosil qiling.")
        return

    await msg.edit_text(f"🔍 {len(texts)} ta post topildi. Uslub tahlil qilinmoqda…")
    samples = "\n\n---\n\n".join(t[:900] for t in texts[-40:])[:60000]
    try:
        analysis = await gemini.generate_json(
            prompts.STYLE_PROMPT.format(samples=samples), temperature=0.3
        )
    except Exception as e:  # noqa: BLE001
        await msg.edit_text(f"❌ Tahlil bo'lmadi: {e}")
        return

    if not isinstance(analysis, dict):
        await msg.edit_text("❌ Tahlil kutilgan formatda kelmadi. Qaytadan urinib ko'ring.")
        return

    await db.set_setting("style_guide", analysis)
    guide = analysis.get("style_guide", "")
    await msg.edit_text(
        "✅ <b>Kanal uslubi o'rganildi!</b>\n\n"
        f"<b>Ohang:</b> {ihtml.escape(str(analysis.get('tone',''))[:200])}\n"
        f"<b>Tuzilishi:</b> {ihtml.escape(str(analysis.get('structure',''))[:250])}\n"
        f"<b>Til:</b> {ihtml.escape(str(analysis.get('language',''))[:150])}\n\n"
        f"<i>{ihtml.escape(str(guide)[:700])}</i>\n\n"
        "Endi barcha yangi postlar shu uslubda yoziladi.",
        parse_mode=ParseMode.HTML,
    )


def _extract_export_texts(data: dict) -> list[str]:
    out = []
    for m in (data.get("messages") or []):
        if m.get("type") != "message":
            continue
        t = m.get("text")
        if isinstance(t, str):
            s = t
        elif isinstance(t, list):
            s = "".join(p if isinstance(p, str) else p.get("text", "") for p in t)
        else:
            s = ""
        s = s.strip()
        if len(s) > 60:
            out.append(s)
    return out


@admin_only
async def cmd_channel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Kanalni ulash / almashtirish / tekshirish."""
    args = context.args or []
    if not args:
        chan = await db.channel_label()
        chat_id = await db.get_channel()
        status = await _channel_status(context, chat_id)
        await update.message.reply_html(
            "<b>📡 Kanal ulanishi</b>\n\n"
            f"Joriy kanal: <b>{ihtml.escape(str(chan))}</b>\n"
            f"ID: <code>{ihtml.escape(str(chat_id or '—'))}</code>\n"
            f"Holat: {status}\n\n"
            "<b>Almashtirish uchun 3 ta yo'l:</b>\n\n"
            "1️⃣ <code>/kanal @kanal_nomi</code>\n"
            "2️⃣ <code>/kanal -1001234567890</code>\n"
            "3️⃣ Kanaldagi istalgan postni shu yerga <b>forward</b> qiling\n\n"
            "⚠️ Bot avval kanalga <b>admin</b> qilinishi va "
            "<b>Post Messages</b> ruxsati berilishi kerak.",
            disable_web_page_preview=True,
        )
        return

    target = args[0].strip()
    if target.startswith("https://t.me/"):
        target = "@" + target.rsplit("/", 1)[-1]
    if not target.startswith(("@", "-")):
        target = "@" + target

    msg = await update.message.reply_html("⏳ Tekshirilmoqda…")
    ok, note = await _check_channel(context, target)
    if not ok:
        await msg.edit_text(f"❌ {note}", parse_mode=ParseMode.HTML)
        return
    await msg.edit_text(f"✅ {note}", parse_mode=ParseMode.HTML)


async def _channel_status(context, chat_id: str) -> str:
    """Qisqa holat satri — hech narsani o'zgartirmaydi."""
    if not chat_id:
        return "⚠️ ulanmagan"
    try:
        me = await context.bot.get_me()
        member = await context.bot.get_chat_member(chat_id, me.id)
    except TelegramError as e:
        return f"⚠️ tekshirib bo'lmadi ({ihtml.escape(str(e)[:60])})"
    if member.status != "administrator":
        return "⚠️ bot admin emas"
    if not getattr(member, "can_post_messages", False):
        return "⚠️ post yozish ruxsati yo'q"
    return "✅ tayyor"


async def _check_channel(context, target: str) -> tuple[bool, str]:
    """Kanalni tekshiradi va hammasi joyida bo'lsa bazaga yozadi."""
    try:
        chat = await context.bot.get_chat(target)
    except TelegramError as e:
        return False, (
            f"Kanal topilmadi: <code>{ihtml.escape(str(e))}</code>\n\n"
            "Bot kanalga admin qilinganini va nom to'g'ri yozilganini tekshiring."
        )

    if chat.type not in ("channel", "supergroup"):
        return False, f"Bu kanal emas ({chat.type}). Kanal havolasini bering."

    try:
        me = await context.bot.get_me()
        member = await context.bot.get_chat_member(chat.id, me.id)
    except TelegramError as e:
        return False, f"Bot huquqlari o'qilmadi: <code>{ihtml.escape(str(e))}</code>"

    if member.status != "administrator":
        return False, (
            f"Bot <b>{ihtml.escape(chat.title or '')}</b> kanalida admin emas.\n"
            "Kanal → Administrators → Add Admin → botni qo'shing."
        )
    if not getattr(member, "can_post_messages", False):
        return False, (
            "Botda <b>Post Messages</b> ruxsati yo'q.\n"
            "Kanal sozlamalarida shu ruxsatni yoqing."
        )

    await db.set_channel(str(chat.id), chat.title or "", chat.username or "")
    label = f"@{chat.username}" if chat.username else (chat.title or str(chat.id))
    return True, (
        f"Kanal ulandi: <b>{ihtml.escape(label)}</b>\n"
        f"ID: <code>{chat.id}</code>\n"
        "Postlar shu kanalga chiqadi."
    )


def _forward_origin_chat(msg):
    """Forward qilingan xabar qaysi kanaldan kelganini aniqlaydi."""
    origin = getattr(msg, "forward_origin", None)
    chat = getattr(origin, "chat", None) if origin is not None else None
    if chat is None:
        chat = getattr(msg, "forward_from_chat", None)
    return chat


@admin_only
async def on_forward(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Forward qilingan xabar. Kanaldan bo'lsa — kanalni ulashni taklif qiladi."""
    msg = update.message
    if msg is None:
        return

    chat = _forward_origin_chat(msg)
    if chat is None or getattr(chat, "type", "") != "channel":
        # Kanaldan emas — odatdagi oqimga qaytaramiz (tahrirlash, fayl)
        if msg.document:
            return await on_document(update, context)
        if msg.text:
            return await on_text(update, context)
        return

    label = f"@{chat.username}" if getattr(chat, "username", None) else (chat.title or str(chat.id))
    current = await db.get_channel()
    if str(chat.id) == str(current):
        await msg.reply_html(f"ℹ️ <b>{ihtml.escape(label)}</b> allaqachon ulangan kanal.")
        return

    # Hech narsa o'zgartirmaymiz — avval adminning tasdig'ini so'raymiz.
    warn = ""
    if current:
        cur_label = await db.channel_label()
        warn = (f"\n\n⚠️ Hozirgi kanal: <b>{ihtml.escape(str(cur_label))}</b>\n"
                "Tasdiqlasangiz, postlar yangi kanalga chiqa boshlaydi.")
    await msg.reply_html(
        f"📡 Bu post <b>{ihtml.escape(label)}</b> kanalidan.{warn}",
        reply_markup=InlineKeyboardMarkup([[
            InlineKeyboardButton("✅ Shu kanalni ulash", callback_data=f"ch:{chat.id}"),
            InlineKeyboardButton("✖️ Yo'q", callback_data="chx"),
        ]]),
    )


@admin_only
async def cmd_footer(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Har bir post oxiridagi kontakt blokini ko'rish/o'zgartirish."""
    current = await db.get_footer()
    context.user_data["editing_footer"] = True
    await update.message.reply_html(
        "<b>\U0001F4DE Post oxiridagi kontakt bloki</b>\n\n"
        "Hozirgi ko'rinishi:\n"
        f"{current}\n\n"
        "<i>O'zgartirish uchun yangi matnni shu yerga yuboring.\n"
        "Havola qo'shish uchun Telegram'ning o'z formatlashidan foydalaning.\n"
        "Bekor qilish: /bekor</i>",
        disable_web_page_preview=True,
    )


@admin_only
async def cmd_test(update: Update, context: ContextTypes.DEFAULT_TYPE):
    from . import jobs
    msg = await update.message.reply_html("⏳ Sinov posti tayyorlanmoqda… (1-2 daqiqa)")
    try:
        await jobs.prepare_post(context.application, slot="tushlik", test_mode=True)
        await msg.delete()
    except Exception as e:  # noqa: BLE001
        log.exception("Test post xatosi")
        await msg.edit_text(f"❌ Xatolik: {e}")


# ------------------------------------------------------------ callbacks
async def on_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    if not q or q.from_user.id != config.ADMIN_CHAT_ID:
        return
    from . import jobs

    if q.data == "chx":
        await q.answer("Bekor qilindi")
        await _mark(q, "✖️ Kanal o'zgartirilmadi")
        return

    if q.data.startswith("ch:"):
        await q.answer("⏳ Tekshirilmoqda…")
        ok, note = await _check_channel(context, q.data[3:])
        await _mark(q, "✅ Kanal ulandi" if ok else "❌ Ulanmadi")
        await context.bot.send_message(
            config.ADMIN_CHAT_ID, ("✅ " if ok else "❌ ") + note,
            parse_mode=ParseMode.HTML,
        )
        return

    try:
        action, sid = q.data.split(":", 1)
        post_id = int(sid)
    except (ValueError, AttributeError):
        await q.answer("Noto'g'ri buyruq")
        return

    post = await db.get_post(post_id)
    if not post:
        await q.answer("Post topilmadi", show_alert=True)
        return

    if action == "ok":
        await db.update_post(post_id, status="approved")
        await q.answer("✅ Tasdiqlandi")
        when = post["scheduled_at"].astimezone(config.TZ)
        if when > datetime.now(config.TZ):
            # /test posti uchun job hali yo'q — shu yerda o'rnatamiz
            jobs.schedule_publish(context.application, post_id, when)
            await _mark(q, f"✅ Tasdiqlandi — {when.strftime('%H:%M')} da chiqadi")
        else:
            ok = await jobs.publish_post(context.application, post_id, force=True)
            await _mark(q, "🚀 Kanalga chiqarildi" if ok else "⚠️ Chiqarishda xatolik")

    elif action == "no":
        await db.update_post(post_id, status="rejected")
        await q.answer("❌ Rad etildi")
        await _mark(q, "❌ Rad etildi — kanalga chiqmaydi")

    elif action == "go":
        await q.answer("🚀 Chiqarilmoqda…")
        ok = await jobs.publish_post(context.application, post_id, force=True)
        await _mark(q, "🚀 Kanalga chiqarildi" if ok else "⚠️ Chiqarishda xatolik")

    elif action == "re":
        await q.answer("🔄 Qayta tayyorlanmoqda…")
        await _mark(q, "🔄 Qayta generatsiya qilinmoqda…")
        try:
            await jobs.regenerate(context.application, post_id)
        except Exception as e:  # noqa: BLE001
            log.exception("Qayta generatsiya xatosi")
            await context.bot.send_message(config.ADMIN_CHAT_ID, f"❌ Qayta generatsiya bo'lmadi: {e}")

    elif action == "ed":
        context.user_data["editing"] = post_id
        await q.answer()
        await context.bot.send_message(
            config.ADMIN_CHAT_ID,
            f"✏️ #{post_id} uchun yangi matnni yuboring.\n"
            "HTML teglari: <code>&lt;b&gt;</code>, <code>&lt;i&gt;</code>, "
            "<code>&lt;u&gt;</code>, <code>&lt;a href=\"\"&gt;</code>\n"
            "Bekor qilish: /bekor",
            parse_mode=ParseMode.HTML,
        )


async def _mark(q, note: str) -> None:
    try:
        await q.edit_message_reply_markup(
            InlineKeyboardMarkup([[InlineKeyboardButton(note, callback_data="noop")]])
        )
    except TelegramError as e:
        log.debug("Tugmani yangilab bo'lmadi: %s", e)


@admin_only
async def cmd_cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data.pop("editing", None)
    context.user_data.pop("editing_footer", None)
    await update.message.reply_html("Bekor qilindi.")


@admin_only
async def on_text(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if context.user_data.pop("editing_footer", None):
        new_footer = (update.message.text_html or update.message.text or "").strip()
        if not new_footer:
            await update.message.reply_html("Bo'sh matn — o'zgartirilmadi.")
            return
        await db.set_footer(new_footer)
        await update.message.reply_html(
            "\u2705 Kontakt bloki yangilandi. Endi har bir post oxirida shu turadi:\n\n"
            + new_footer,
            disable_web_page_preview=True,
        )
        return

    post_id = context.user_data.get("editing")
    if not post_id:
        return
    new_text = update.message.text_html or update.message.text or ""
    if not new_text.strip():
        return
    post = await db.get_post(post_id)
    context.user_data.pop("editing", None)
    if not post:
        await update.message.reply_html("❌ Post topilmadi — o'chirilgan bo'lishi mumkin.")
        return
    if post["status"] in ("published", "rejected", "failed"):
        await update.message.reply_html(
            f"⚠️ Bu post allaqachon <b>{post['status']}</b> holatida — o'zgartirilmadi."
        )
        return

    from . import jobs
    body = pipeline.compose(new_text, "", await db.get_footer())
    await db.update_post(post_id, body=body, status="approved")
    when = post["scheduled_at"].astimezone(config.TZ)
    if when > datetime.now(config.TZ):
        # /test posti uchun chiqarish vazifasi hali o'rnatilmagan bo'lishi mumkin
        jobs.schedule_publish(context.application, post_id, when)
        await update.message.reply_html(
            f"✅ Matn yangilandi va tasdiqlandi.\n"
            f"{when.strftime('%d.%m %H:%M')} da kanalga chiqadi."
        )
    else:
        ok = await jobs.publish_post(context.application, post_id, force=True)
        await update.message.reply_html(
            "✅ Matn yangilandi va kanalga chiqarildi." if ok
            else "⚠️ Matn yangilandi, lekin kanalga chiqarishda xatolik."
        )


def register(app) -> None:
    app.add_handler(CommandHandler("start", cmd_start))
    app.add_handler(CommandHandler("help", cmd_start))
    app.add_handler(CommandHandler("reja", cmd_plan))
    app.add_handler(CommandHandler("reja_yangi", cmd_plan_new))
    app.add_handler(CommandHandler("vaqt", cmd_times))
    app.add_handler(CommandHandler("vaqt_oldin", cmd_lead))
    app.add_handler(CommandHandler("navbat", cmd_queue))
    app.add_handler(CommandHandler("pauza", cmd_pause))
    app.add_handler(CommandHandler("davom", cmd_resume))
    app.add_handler(CommandHandler("statistika", cmd_stats))
    app.add_handler(CommandHandler("manba", cmd_sources))
    app.add_handler(CommandHandler("manba_qosh", cmd_source_add))
    app.add_handler(CommandHandler("manba_ochir", cmd_source_del))
    app.add_handler(CommandHandler("uslub", cmd_style))
    app.add_handler(CommandHandler("kanal", cmd_channel))
    app.add_handler(CommandHandler("kontakt", cmd_footer))
    app.add_handler(CommandHandler("test", cmd_test))
    app.add_handler(CommandHandler("bekor", cmd_cancel))
    app.add_handler(CallbackQueryHandler(on_callback))
    # Faqat yangi xabarlar: tahrirlangan xabarda update.message = None bo'ladi
    fresh = filters.UpdateType.MESSAGE
    # Forward birinchi turadi — kanal ulash oqimi fayl/matndan ustun
    app.add_handler(MessageHandler(fresh & filters.FORWARDED & ~filters.COMMAND, on_forward))
    app.add_handler(MessageHandler(fresh & filters.Document.ALL, on_document))
    app.add_handler(MessageHandler(fresh & filters.TEXT & ~filters.COMMAND, on_text))
