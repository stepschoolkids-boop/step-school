"""Rejalashtirilgan vazifalar: tayyorlash, tasdiqlash, chiqarish."""
import html as ihtml
import json
import logging
import re
from datetime import datetime, time as dtime, timedelta

from telegram.constants import ParseMode
from telegram.error import TelegramError

from . import config, db, handlers, pipeline

log = logging.getLogger(__name__)

PREP_PREFIX = "prep_"
PUB_PREFIX = "pub_"
PLAN_JOB = "weekly_plan"


# ------------------------------------------------------------------ utils
def _now() -> datetime:
    return datetime.now(config.TZ)


def _parse_hhmm(s: str) -> tuple[int, int]:
    h, m = s.split(":")
    return int(h), int(m)


def _slot_datetime(day: datetime, hhmm: str) -> datetime:
    h, m = _parse_hhmm(hhmm)
    return day.replace(hour=h, minute=m, second=0, microsecond=0)


# ------------------------------------------------------------------ core
async def prepare_post(app, slot: str, test_mode: bool = False) -> int | None:
    """Postni tayyorlab, adminga tasdiqlash uchun yuboradi."""
    if not test_mode and await db.is_paused():
        log.info("Pauza — %s sloti o'tkazib yuborildi", slot)
        return None

    now = _now()
    slots = await db.get_slots()
    hhmm = slots.get(slot, config.DEFAULT_SLOTS.get(slot, "12:00"))
    lead = int(await db.get_setting("lead_minutes", config.DEFAULT_LEAD_MINUTES))

    scheduled_at = _slot_datetime(now, hhmm)
    if scheduled_at <= now:
        scheduled_at = now + timedelta(minutes=lead)

    week_start = (now - timedelta(days=now.weekday())).date()
    topic, ctype = await pipeline.pick_topic(week_start, now.weekday(), slot)
    day_label = f"{now.strftime('%d.%m.%Y')}, {slot}"

    log.info("Post tayyorlanmoqda: slot=%s mavzu=%s", slot, topic[:60])
    try:
        draft = await pipeline.build_post(topic, ctype, slot, day_label)
    except Exception as e:  # noqa: BLE001
        log.exception("Post tayyorlanmadi")
        await _notify(app, f"⚠️ <b>{slot}</b> posti tayyorlanmadi:\n<code>{ihtml.escape(str(e))}</code>")
        return None

    post_id = await db.create_post(
        slot=slot,
        scheduled_at=scheduled_at,
        status="pending_approval",
        topic=draft.topic,
        content_type=draft.content_type,
        lang=draft.lang,
        body=draft.body,
        hashtags=draft.hashtags,
        qc_score=draft.qc_score,
        qc_notes=draft.qc_notes,
        is_test=test_mode,
        sources=json.dumps(draft.sources, ensure_ascii=False),
    )

    await _send_for_approval(app, post_id)

    if not test_mode:
        schedule_publish(app, post_id, scheduled_at)
    return post_id


async def _send_for_approval(app, post_id: int) -> None:
    post = await db.get_post(post_id)
    when = post["scheduled_at"].astimezone(config.TZ)
    caption = handlers.preview_caption(post, when)
    kb = handlers.approval_keyboard(post_id)

    try:
        msg = await app.bot.send_message(
            chat_id=config.ADMIN_CHAT_ID, text=caption,
            parse_mode=ParseMode.HTML, reply_markup=kb,
            disable_web_page_preview=True,
        )
        await db.update_post(post_id, approval_msg_id=msg.message_id)
    except TelegramError as e:
        log.error("Tasdiqlash xabari yuborilmadi: %s", e)
        # HTML buzilgan bo'lishi mumkin — oddiy matn bilan urinamiz
        try:
            msg = await app.bot.send_message(
                chat_id=config.ADMIN_CHAT_ID,
                text=f"#{post_id} — {post['topic']}\n\n{post['body']}"[:4000],
                reply_markup=kb,
            )
            await db.update_post(post_id, approval_msg_id=msg.message_id)
        except TelegramError as e2:
            log.error("Zaxira xabar ham yuborilmadi: %s", e2)


async def regenerate(app, post_id: int) -> None:
    post = await db.get_post(post_id)
    if not post:
        return
    now = _now()
    draft = await pipeline.build_post(
        post["topic"], post["content_type"], post["slot"],
        f"{now.strftime('%d.%m.%Y')}, {post['slot']}",
    )
    await db.update_post(
        post_id,
        body=draft.body, hashtags=draft.hashtags,
        qc_score=draft.qc_score, qc_notes=draft.qc_notes, lang=draft.lang,
        status="pending_approval", regen_count=(post["regen_count"] or 0) + 1,
        sources=json.dumps(draft.sources, ensure_ascii=False),
    )
    if post["approval_msg_id"]:
        try:
            await app.bot.delete_message(config.ADMIN_CHAT_ID, post["approval_msg_id"])
        except TelegramError:
            pass
    await _send_for_approval(app, post_id)


async def publish_post(app, post_id: int, force: bool = False) -> bool:
    post = await db.get_post(post_id)
    if not post:
        return False
    if post["status"] == "published":
        return True
    if post["status"] == "rejected" and not force:
        log.info("#%s rad etilgan — chiqarilmaydi", post_id)
        return False
    if post["status"] not in ("pending_approval", "approved") and not force:
        return False

    body = post["body"] or ""
    channel = await db.get_channel()
    if not channel:
        await db.update_post(post_id, status="failed", error="kanal ulanmagan")
        await _notify(app, "❌ Kanal ulanmagan. /kanal buyrug'i bilan ulang.")
        return False

    try:
        msg = await app.bot.send_message(
            chat_id=channel, text=body[:config.POST_LIMIT],
            parse_mode=ParseMode.HTML, disable_web_page_preview=True,
        )
    except TelegramError as e:
        # HTML buzilgan bo'lishi mumkin — teglarsiz qayta urinamiz, post yo'qolmasin
        log.warning("HTML bilan chiqmadi #%s: %s — oddiy matn bilan urinamiz", post_id, e)
        plain = re.sub(r"<[^>]+>", "", body)
        try:
            msg = await app.bot.send_message(
                chat_id=channel, text=plain[:config.POST_LIMIT],
                disable_web_page_preview=True,
            )
        except TelegramError as e2:
            log.error("Kanalga chiqarilmadi #%s: %s", post_id, e2)
            await db.update_post(post_id, status="failed", error=str(e2)[:500])
            await _notify(app, f"❌ #{post_id} kanalga chiqmadi:\n<code>{ihtml.escape(str(e2))}</code>")
            return False

    await db.update_post(post_id, status="published", channel_msg_id=msg.message_id)
    auto = "avtomatik" if post["status"] == "pending_approval" else "tasdiqlangan"
    await _notify(app, f"✅ #{post_id} kanalga chiqdi ({auto}).")
    return True


async def _notify(app, text: str) -> None:
    try:
        await app.bot.send_message(config.ADMIN_CHAT_ID, text, parse_mode=ParseMode.HTML)
    except TelegramError as e:
        log.warning("Admin xabardor qilinmadi: %s", e)


# ------------------------------------------------------------------ jobs
async def _prep_job(context) -> None:
    await prepare_post(context.application, context.job.data["slot"])


async def _pub_job(context) -> None:
    await publish_post(context.application, context.job.data["post_id"])


async def _plan_job(context) -> None:
    """Har yakshanba kechqurun — kelasi hafta rejasi."""
    now = _now()
    if now.weekday() != 6:          # 6 = yakshanba
        return
    next_week = (now + timedelta(days=1)).date()
    next_week = next_week - timedelta(days=next_week.weekday())
    slots = list((await db.get_slots()).keys())
    try:
        items = await pipeline.generate_week_plan(next_week, slots)
        await _notify(
            context.application,
            f"📅 Kelasi hafta uchun {len(items)} ta mavzu rejalashtirildi.\n/reja bilan ko'ring.",
        )
    except Exception as e:  # noqa: BLE001
        log.exception("Haftalik reja tuzilmadi")
        await _notify(context.application, f"⚠️ Haftalik reja tuzilmadi: <code>{ihtml.escape(str(e))}</code>")


def schedule_publish(app, post_id: int, when: datetime) -> None:
    name = f"{PUB_PREFIX}{post_id}"
    for j in app.job_queue.get_jobs_by_name(name):
        j.schedule_removal()
    app.job_queue.run_once(_pub_job, when=when, data={"post_id": post_id}, name=name)
    log.info("#%s chiqarish rejalashtirildi: %s", post_id, when.strftime("%d.%m %H:%M"))


async def reschedule(app) -> None:
    """Slot vaqtlari o'zgarganda tayyorlash vazifalarini qayta o'rnatadi."""
    jq = app.job_queue
    for job in list(jq.jobs()):
        if job.name and job.name.startswith(PREP_PREFIX):
            job.schedule_removal()

    slots = await db.get_slots()
    lead = int(await db.get_setting("lead_minutes", config.DEFAULT_LEAD_MINUTES))

    for slot, hhmm in slots.items():
        h, m = _parse_hhmm(hhmm)
        base = datetime(2000, 1, 1, h, m, tzinfo=config.TZ) - timedelta(minutes=lead)
        jq.run_daily(
            _prep_job,
            time=dtime(hour=base.hour, minute=base.minute, tzinfo=config.TZ_APS),
            data={"slot": slot},
            name=f"{PREP_PREFIX}{slot}",
        )
        log.info("Slot '%s': post %s da, tayyorlash %02d:%02d da",
                 slot, hhmm, base.hour, base.minute)


async def restore_pending(app) -> None:
    """Servis qayta ishga tushganda kutilayotgan postlarni tiklaydi."""
    now = _now()
    for post in await db.upcoming_posts(50):
        if post["status"] not in ("pending_approval", "approved"):
            continue
        # Sinov posti tasdiqlanmagan bo'lsa — qayta ishga tushganda o'z-o'zidan
        # kanalga chiqib ketmasligi kerak.
        if post["is_test"] and post["status"] != "approved":
            await db.update_post(post["id"], status="failed",
                                 error="sinov posti tasdiqlanmadi")
            continue
        when = post["scheduled_at"].astimezone(config.TZ)
        if when > now:
            schedule_publish(app, post["id"], when)
        elif now - when <= timedelta(minutes=30):
            log.info("#%s kechikkan — hozir chiqariladi", post["id"])
            await publish_post(app, post["id"])
        else:
            await db.update_post(post["id"], status="failed",
                                 error="servis o'chiq bo'lgani uchun o'tkazib yuborildi")


async def ensure_plan(app) -> None:
    """Joriy hafta uchun reja bo'lmasa — tuzadi."""
    now = _now()
    week_start = (now - timedelta(days=now.weekday())).date()
    if await db.get_week_plan(week_start):
        return
    slots = list((await db.get_slots()).keys())
    try:
        items = await pipeline.generate_week_plan(week_start, slots)
        log.info("Joriy hafta rejasi tuzildi: %d ta mavzu", len(items))
    except Exception as e:  # noqa: BLE001
        log.warning("Boshlang'ich reja tuzilmadi: %s", e)


async def setup(app) -> None:
    await reschedule(app)
    app.job_queue.run_daily(
        _plan_job, time=dtime(hour=21, minute=0, tzinfo=config.TZ_APS), name=PLAN_JOB
    )
    await restore_pending(app)
