# Step Multilevel — avtomatik Telegram post boti

CEFR Multilevel mavzusida har kuni 3 ta post: yangilik qidiradi, matn yozadi,
sifat nazoratidan o'tkazadi va kanalga chiqaradi. Postlar matnli — rasm ishlatilmaydi.
Har post chiqishidan 10 daqiqa oldin admin tasdig'iga yuboriladi.

## Ish tartibi

```
07:50 / 11:50 / 19:50   →  post tayyorlanadi
                            ├─ RSS manbalari + Google qidiruv
                            ├─ mavzu filtri (CEFR Multilevel doirasi)
                            ├─ Gemini: post matni
                            └─ Gemini: sifat nazorati (fakt, til, format)
                        →  adminga tugmalar bilan yuboriladi
                            ✅ Tasdiqlash  ❌ Rad etish
                            🔄 Qayta generatsiya  🚀 Hozir  ✏️ Tahrirlash
08:00 / 12:00 / 20:00   →  javob bo'lmasa AVTOMATIK kanalga chiqadi
```

## Buyruqlar

| Buyruq | Vazifasi |
|---|---|
| `/start` | Bot haqida, buyruqlar ro'yxati |
| `/reja` | 1 haftalik post mavzulari |
| `/reja_yangi` | Rejani qaytadan tuzish |
| `/navbat` | Navbatdagi postlar |
| `/vaqt` | Post vaqtlarini ko'rish |
| `/vaqt ertalab 08:30` | Slot vaqtini o'zgartirish |
| `/vaqt_oldin 15` | Tasdiqlash necha daqiqa oldin kelsin |
| `/test` | Hozir sinov posti tayyorlash (kanalga chiqmaydi) |
| `/uslub` | Eski postlardan kanal uslubini o'rgatish |
| `/manba` | Yangilik manbalari ro'yxati |
| `/manba_qosh <url> <nomi>` | Manba qo'shish |
| `/manba_ochir <id>` | Manbani o'chirish |
| `/pauza` · `/davom` | Avtomatikani to'xtatish / yoqish |
| `/statistika` | Hisobot |

## Environment variables

| Nomi | Majburiy | Izoh |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | ✅ | @BotFather bergan token |
| `ADMIN_CHAT_ID` | ✅ | Admin Telegram ID (raqam) |
| `CHANNEL_ID` | ✅ | `@step_postchanel` yoki `-100...` |
| `GEMINI_API_KEY` | ✅ | Google AI Studio kaliti |
| `DATABASE_URL` | ✅ | Postgres connection string |
| `TZ` | — | `Asia/Tashkent` (standart) |
| `LEAD_MINUTES` | — | Tasdiqlash necha daqiqa oldin (10) |
| `CHANNEL_NAME` | — | Rasmda ko'rinadigan nom |
| `GEMINI_TEXT_MODEL` | — | `gemini-3.5-flash-lite` |
| `TOPIC_SCOPE` | — | Mavzu chegarasi matni |

Model nomi o'zgarsa — kodga tegmasdan `GEMINI_TEXT_MODEL`
ni almashtirish kifoya.

## Lokal ishga tushirish

```bash
pip install -r requirements.txt
cp .env.example .env      # va to'ldiring
python main.py
```

## Render'ga joylash

1. Bu papkani GitHub repozitoriyaga yuklang
2. Render → New → Web Service → shu repo
3. Runtime: Python · Build: `pip install -r requirements.txt` · Start: `python main.py`
4. Environment variables — yuqoridagi jadval bo'yicha
5. Health check path: `/health`

**Muhim:** bepul tarifda servis 15 daqiqa harakatsizlikdan keyin uxlaydi.
[cron-job.org](https://cron-job.org) da har 10 daqiqada `https://<servis>.onrender.com/health`
manzilini chaqiruvchi vazifa yarating — shunda bot doim uyg'oq turadi.

## Tuzilishi

```
main.py              ishga tushirish, HTTP health server
app/config.py        environment sozlamalari
app/db.py            Postgres — postlar, reja, manbalar, sozlamalar
app/gemini.py        Gemini REST klienti (matn, JSON)
app/prompts.py       barcha promptlar (mavzu chegarasi shu yerda)
app/sources.py       RSS manbalari va filtr
app/pipeline.py      qidiruv → yozish → sifat nazorati
app/handlers.py      bot buyruqlari va tugmalar
app/jobs.py          jadval, tasdiqlash, chiqarish
```

## Xavfsizlik

`.env` faylini hech qachon GitHub'ga yuklamang — `.gitignore` da bor.
Barcha kalitlar Render'ning Environment bo'limida saqlanadi.
