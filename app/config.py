"""Konfiguratsiya — barcha sozlamalar environment variable orqali."""
import os
from zoneinfo import ZoneInfo

import pytz


def _req(name: str) -> str:
    v = os.environ.get(name, "").strip()
    if not v:
        raise RuntimeError(f"Environment variable '{name}' o'rnatilmagan!")
    return v


def _opt(name: str, default: str = "") -> str:
    return os.environ.get(name, default).strip()


# --- Telegram ---
BOT_TOKEN = _req("TELEGRAM_BOT_TOKEN")
ADMIN_CHAT_ID = int(_req("ADMIN_CHAT_ID"))

# Zaxira kanal — asosiysi bazada saqlanadi va bot orqali /kanal bilan o'rnatiladi.
# Bo'sh qoldirilsa: kanal ulanmagan deb hisoblanadi va post chiqmaydi
# (noto'g'ri kanalga yozib yuborishdan ko'ra to'xtagani yaxshi).
CHANNEL_ID = _opt("CHANNEL_ID", "")

# --- Gemini ---
GEMINI_API_KEY = _req("GEMINI_API_KEY")
GEMINI_BASE = _opt("GEMINI_BASE", "https://generativelanguage.googleapis.com/v1beta")
TEXT_MODEL = _opt("GEMINI_TEXT_MODEL", "gemini-3.5-flash-lite")
# Model nomi o'zgarsa — kodga tegmasdan env orqali almashtiriladi.

# --- Baza ---
DATABASE_URL = _req("DATABASE_URL")

# --- Vaqt ---
_TZ_NAME = _opt("TZ", "Asia/Tashkent")
TZ = ZoneInfo(_TZ_NAME)
# APScheduler (PTB JobQueue) faqat pytz zonalarini qabul qiladi —
# ZoneInfo berilsa TypeError bilan yiqiladi.
TZ_APS = pytz.timezone(_TZ_NAME)

# Standart post vaqtlari (bot orqali /vaqt bilan o'zgartiriladi)
DEFAULT_SLOTS = {
    "ertalab": "08:00",
    "tushlik": "12:00",
    "kechqurun": "20:00",
}

# Tasdiqlash uchun necha daqiqa oldin yuborilsin
DEFAULT_LEAD_MINUTES = int(_opt("LEAD_MINUTES", "10"))

# --- Server ---
PORT = int(_opt("PORT", "10000"))

# --- Brend ---
CHANNEL_NAME = _opt("CHANNEL_NAME", "Step Multilevel")

# --- Post uzunligi ---
# Telegram oddiy xabar chegarasi 4096 belgi. Postlar mazmunli va batafsil
# bo'lishi kerak, shuning uchun maqsadli oraliq keng olingan.
POST_LIMIT = 4096
POST_MIN_CHARS = int(_opt("POST_MIN_CHARS", "1400"))
POST_MAX_CHARS = int(_opt("POST_MAX_CHARS", "3400"))

# Har bir post oxiriga qo'shiladigan kontakt bloki.
# Bazadagi "footer" sozlamasi ustunroq — bot orqali /kontakt bilan o'zgartiriladi.
POST_FOOTER = _opt("POST_FOOTER", (
    "\U0001F4DE <b>Murojaat uchun:</b>\n"
    "Tel: +998 99 141 49 48\n"
    "Telegram: @Stepschooladmin_Malika\n"
    "Instagram: <a href=\"https://www.instagram.com/step.multilevel\">Step.multilevel</a>"
))

# Mavzu doirasi — qattiq guardrail
TOPIC_SCOPE = _opt(
    "TOPIC_SCOPE",
    "CEFR Multilevel (O'zbekiston Milliy sertifikat) ingliz tili imtihoni: "
    "imtihon tuzilishi, Listening, Reading, Writing, Speaking bo'limlari, "
    "baholash mezonlari, ro'yxatdan o'tish va rasmiy yangiliklar, "
    "grammatika, lug'at, imtihonga tayyorgarlik strategiyalari, "
    "A1-C1 darajalar, namunaviy topshiriqlar va javoblar."
)

# Rasmiy, tekshirilgan faktlar — modelga tayanch sifatida beriladi.
# Manba: uzbmb.uz (Bilim va malakalarni baholash agentligi) rasmiy hujjatlari.
VERIFIED_FACTS = """[TEKSHIRILGAN RASMIY FAKTLAR — manba: uzbmb.uz]
- Imtihon 4 ta bo'limdan iborat: Listening, Reading, Writing, Speaking.
- Umumiy maksimal ball: 75.
- Daraja chegaralari: C1 = 65-75 ball, B2 = 51-64 ball, B1 = 38-50 ball,
  38 balldan past = daraja berilmaydi.
- Writing bo'limida 1-topshiriq umumiy balning 33% (12 ball),
  2-topshiriq 67% (24 ball) ulushiga ega.
- Milliy sertifikat 3 yil muddatga amal qiladi.
- Ro'yxatdan o'tish my.gov.uz yagona portali orqali amalga oshiriladi.

DIQQAT: yuqoridagilardan tashqari aniq raqam, sana yoki narx yozma —
agar u qidiruv natijalarida aniq ko'rsatilmagan bo'lsa. O'ylab topilgan
raqam kanal obro'siga zarar yetkazadi."""
