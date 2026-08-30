"""Step Multilevel — avtomatik Telegram post boti.

Ishga tushirish: python main.py
Render'da: startCommand = python main.py
"""
import asyncio
import logging
import os
import signal

from aiohttp import web
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    format="%(asctime)s %(levelname)-7s %(name)s | %(message)s",
    level=logging.INFO,
)
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("apscheduler").setLevel(logging.WARNING)
log = logging.getLogger("main")

from telegram import BotCommand           # noqa: E402
from telegram.ext import Application      # noqa: E402

from app import config, db, handlers, jobs, sources  # noqa: E402

COMMANDS = [
    BotCommand("start", "Bot haqida va buyruqlar"),
    BotCommand("kanal", "Kanalni ulash yoki almashtirish"),
    BotCommand("kontakt", "Post oxiridagi kontakt bloki"),
    BotCommand("reja", "Haftalik post mavzulari"),
    BotCommand("reja_yangi", "Rejani qaytadan tuzish"),
    BotCommand("navbat", "Navbatdagi postlar"),
    BotCommand("vaqt", "Post vaqtlari"),
    BotCommand("vaqt_oldin", "Tasdiqlash necha daqiqa oldin"),
    BotCommand("test", "Sinov posti tayyorlash"),
    BotCommand("uslub", "Kanal uslubini o'rgatish"),
    BotCommand("manba", "Yangilik manbalari"),
    BotCommand("pauza", "Avtomatikani to'xtatish"),
    BotCommand("davom", "Avtomatikani yoqish"),
    BotCommand("statistika", "Hisobot"),
]


async def health(request: web.Request) -> web.Response:
    """Render health-check va uptime ping uchun."""
    return web.json_response({"status": "ok", "service": "step-multilevel-bot"})


async def start_web() -> web.AppRunner:
    app = web.Application()
    app.router.add_get("/", health)
    app.router.add_get("/health", health)
    app.router.add_get("/ping", health)
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, "0.0.0.0", config.PORT)
    await site.start()
    log.info("HTTP server: 0.0.0.0:%s", config.PORT)
    return runner


async def main() -> None:
    await db.init()
    await sources.ensure_default_sources()

    application = Application.builder().token(config.BOT_TOKEN).build()
    handlers.register(application)

    await application.initialize()
    await application.start()
    await application.bot.set_my_commands(COMMANDS)

    me = await application.bot.get_me()
    log.info("Bot ishga tushdi: @%s", me.username)

    await jobs.setup(application)
    await application.updater.start_polling(drop_pending_updates=True)

    runner = await start_web()

    try:
        chan = await db.channel_label()
        await application.bot.send_message(
            config.ADMIN_CHAT_ID,
            f"🟢 Bot ishga tushdi (@{me.username}).\n"
            f"Kanal: {chan}\n"
            "/start — buyruqlar ro'yxati",
        )
    except Exception as e:  # noqa: BLE001
        log.warning("Adminga salom yuborilmadi: %s", e)

    # Boshlang'ich reja — fon rejimida, ishga tushishni sekinlashtirmasin.
    # Havolani saqlab qolamiz, aks holda task GC bo'lib ketishi mumkin.
    plan_task = asyncio.create_task(jobs.ensure_plan(application))

    def _plan_done(t: asyncio.Task) -> None:
        if not t.cancelled() and t.exception():
            log.warning("Boshlang'ich reja tuzilmadi: %s", t.exception())

    plan_task.add_done_callback(_plan_done)

    stop = asyncio.Event()
    loop = asyncio.get_running_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        try:
            loop.add_signal_handler(sig, stop.set)
        except NotImplementedError:
            pass

    log.info("Tayyor. Kutilmoqda…")
    await stop.wait()

    log.info("To'xtatilmoqda…")
    plan_task.cancel()
    await application.updater.stop()
    await application.stop()
    await application.shutdown()
    await runner.cleanup()
    await db.close()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
