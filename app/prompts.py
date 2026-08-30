"""Gemini uchun promptlar — barchasi CEFR Multilevel doirasida ushlab turadi."""
from . import config

SYSTEM = f"""Sen "{config.CHANNEL_NAME}" Telegram kanali uchun kontent yozuvchi
tajribali CEFR Multilevel repetitorisan. Sening postlaring o'quvchiga
DARSLIK darajasida foyda beradi — quruq maslahat emas, tushuntirish.

KANAL MAVZUSI (qat'iy chegara):
{config.TOPIC_SCOPE}

{config.VERIFIED_FACTS}

QAT'IY QOIDALAR:
1. Bu mavzudan CHIQIB KETMA. Siyosat, din, shou-biznes, boshqa fanlar,
   umumiy motivatsion gaplar — TAQIQLANGAN.
2. Faktlarni o'ylab topma. Yuqoridagi tekshirilgan faktlar va berilgan
   qidiruv natijalaridan tashqari aniq raqam/sana/narx yozma.
3. O'zbek tilida lotin alifbosida, tabiiy va sodda yoz. O'quvchiga "siz".
4. HAR BIR postda kamida 3 ta ANIQ inglizcha misol bo'lsin — to'liq jumla,
   yonida o'zbekcha izohi bilan. Mavhum gap emas, ko'rsatib bering.
5. "Nima" bilan cheklanma — "NEGA shunday" va "IMTIHONDA QANDAY KELADI"ni
   ham tushuntir. O'quvchi postni o'qib bo'lgach mavzuni tushungan bo'lsin.
6. Telegram uchun yoz: qisqa abzatslar, bo'sh qatorlar bilan ajratilgan,
   o'rinli joyda emoji (ko'pi bilan 6-7 ta), o'qishga oson.
7. Clickbait va bo'sh va'da yo'q. Har bir post o'quvchiga aniq foyda bersin.
8. Matn HTML formatida: faqat <b>, <i>, <u>, <code>, <a href="..."> teglari.
   Markdown (** yoki __) ISHLATMA. Ro'yxat uchun • yoki – belgisidan foydalan.
"""

STYLE_FALLBACK = """Kanal uslubi hali o'rganilmagan. Standart uslub:
- Diqqatni tortuvchi aniq sarlavha (qalin harflar bilan)
- Qisqa kirish: bu bilim imtihonda nimaga kerak
- Asosiy qism: qoida/mezon batafsil tushuntirilgan
- Aniq misollar: inglizcha jumla + o'zbekcha izoh
- ❌ tipik xato / ✅ to'g'ri variant taqqoslash
- Mini-mashq yoki tekshiruv savoli
- Qisqa yakun va o'quvchiga savol
"""

# Postning majburiy tuzilishi — mazmunlilikni kafolatlaydi.
POST_STRUCTURE = """POST TUZILISHI (shu tartibda, sarlavhalar qalin harflar bilan):

1. <b>Sarlavha</b> — aniq va mavzuni ochib beruvchi (clickbait emas)

2. Kirish (1-2 gap) — bu mavzu Multilevel imtihonida nimaga kerak,
   qaysi bo'limda va qanday ta'sir qiladi

3. <b>Asosiy qism</b> — qoida, mezon yoki strategiya BATAFSIL tushuntirilgan.
   Faqat "shunday qiling" emas, "nega shunday" ham. 2-4 abzats yoki ro'yxat.

4. <b>Misollar</b> — kamida 3 ta to'liq inglizcha jumla, har biri yonida
   o'zbekcha izoh bilan. Kerak bo'lsa ❌ xato / ✅ to'g'ri ko'rinishida.

5. <b>Imtihonda</b> — bu bilim Listening/Reading/Writing/Speaking'ning
   qaysi topshirig'ida qanday ko'rinishda uchraydi, baholovchi nimaga qaraydi

6. <b>Mini-mashq</b> — o'quvchi uchun 2-3 ta savol yoki topshiriq.
   Javoblarni post oxirida bering.

7. Yakun — bitta amaliy maslahat va o'quvchiga savol (izohga chaqiruv)"""


def post_prompt(topic: str, content_type: str, lang_hint: str,
                style_guide: str, research: str, day_label: str) -> str:
    return f"""Quyidagi ma'lumot asosida Telegram kanali uchun BITTA to'liq post yoz.

MAVZU: {topic}
POST TURI: {content_type}
TIL: {lang_hint}
VAQT: {day_label}

KANAL USLUBI (avvalgi postlar tahlilidan):
{style_guide}

TOPILGAN MA'LUMOTLAR (aniq faktlar faqat shulardan va tekshirilgan
rasmiy faktlardan olinadi):
{research}

{POST_STRUCTURE}

UZUNLIK: post matni {config.POST_MIN_CHARS}-{config.POST_MAX_CHARS} belgi
oralig'ida bo'lsin. Bu QAT'IY. Qisqa, yuzaki post yaramaydi — o'quvchi
mavzuni to'liq tushunadigan darajada yoz. Lekin suv quyma: har bir gap
yangi ma'lumot yoki misol bersin.

FAQAT quyidagi JSON formatida javob ber, boshqa hech narsa yozma:
{{
  "title": "qisqa sarlavha",
  "body": "<b>Sarlavha</b>\\n\\nTo'liq post matni HTML formatida",
  "hashtags": "#multilevel #cefr #ingliztili",
  "lang": "uz | en | mixed",
  "sources": ["ishlatilgan havolalar"]
}}"""


RESEARCH_SYSTEM = f"""Sen ingliz tili imtihonlari bo'yicha tadqiqotchisan.
Faqat quyidagi mavzu doirasida ishlaysan:
{config.TOPIC_SCOPE}
"""


def research_prompt(topic: str) -> str:
    return f"""Quyidagi mavzu bo'yicha internetdan eng so'nggi va ishonchli
ma'lumotlarni top: "{topic}"

Diqqat: mavzu CEFR Multilevel / ingliz tili imtihoni doirasidan chiqmasin.

MANBA USTUVORLIGI (shu tartibda ishon):
1. uzbmb.uz — Bilim va malakalarni baholash agentligi (rasmiy, eng ishonchli)
2. my.gov.uz — ro'yxatdan o'tish va rasmiy tartib
3. Cambridge English, British Council, Council of Europe — CEFR metodikasi
4. Boshqa manbalar — faqat yuqoridagilarga zid bo'lmasa

Post yozish uchun yetarli MATERIAL yig': nafaqat sarlavha, balki
tushuntirish, qoida, misollar va tipik xatolar ham.

FAQAT JSON qaytar:
{{
  "found": true,
  "summary": "5-10 gapda batafsil mazmun, aniq faktlar bilan",
  "key_points": ["muhim nuqta 1", "muhim nuqta 2", "muhim nuqta 3"],
  "examples": ["postda ishlatish mumkin bo'lgan aniq inglizcha misollar"],
  "common_mistakes": ["o'quvchilar shu mavzuda qiladigan tipik xatolar"],
  "sources": ["https://..."],
  "freshness": "yangi | umumiy"
}}
Agar ishonchli ma'lumot topilmasa "found": false qaytar."""


def qc_prompt(body: str, topic: str, research: str) -> str:
    return f"""Quyidagi Telegram postini qattiq sifat nazoratidan o'tkaz.

MAVZU: {topic}

MANBA MA'LUMOTLARI:
{research}

{config.VERIFIED_FACTS}

POST:
{body}

TEKSHIR:
1. mavzu — post CEFR Multilevel / ingliz tili imtihoni doirasidami?
2. fakt — postdagi har bir aniq da'vo (sana, raqam, ball, qoida) manbada
   yoki tekshirilgan faktlarda bormi? Yo'q bo'lsa — olib tashla yoki
   umumiy shaklga o'tkaz. O'ylab topilgan raqam qolmasin.
3. MAZMUNLILIK — bu eng muhim mezon. Post yuzaki emasmi?
   - kamida 3 ta aniq inglizcha misol bormi?
   - "nega shunday" tushuntirilganmi, yoki faqat quruq ro'yxatmi?
   - imtihonda qanday kelishi ko'rsatilganmi?
   - mini-mashq bormi?
   Agar yo'q bo'lsa — fixed_body da SHU QISMLARNI QO'SHIB, postni
   to'ldirib yoz. Qisqartirma, aksincha boyit.
4. til — o'zbekcha matn lotin alifbosida, grammatik to'g'rimi?
   Inglizcha misollar 100% xatosizmi?
5. format — faqat <b>,<i>,<u>,<code>,<a> teglari; markdown yo'q;
   uzunligi {config.POST_MIN_CHARS}-{config.POST_MAX_CHARS} belgi oralig'ida.
   Qisqa bo'lsa — to'ldir. Uzun bo'lsa — suvini siqib chiqar.

FAQAT JSON qaytar:
{{
  "on_topic": true,
  "score": 0-100,
  "issues": ["topilgan muammolar"],
  "fixed_body": "tuzatilgan va to'ldirilgan to'liq post matni (HTML)",
  "verdict": "ok | fix | reject"
}}
"reject" faqat post mavzudan butunlay chiqib ketgan yoki jiddiy noto'g'ri
ma'lumot bo'lsa. Yuzaki bo'lsa — reject qilma, to'ldirib yoz."""


def weekly_plan_prompt(slots: list[str], week_label: str, recent_topics: str) -> str:
    n = 7 * len(slots)
    return f"""Kelayotgan hafta ({week_label}) uchun {n} ta post mavzusini rejalashtir.
Har kuni {len(slots)} ta post: {", ".join(slots)}.

MAVZU DOIRASI (chiqib ketma):
{config.TOPIC_SCOPE}

YAQINDA CHIQQAN MAVZULAR (takrorlama):
{recent_topics or "— hali post chiqmagan —"}

TAQSIMOT PRINSIPI:
- ertalab: grammatika yoki lug'at — bitta aniq qoida yoki so'zlar to'plami
- tushlik: amaliy strategiya — Listening/Reading/Writing/Speaking bo'yicha
  aniq texnika yoki topshiriq turi tahlili
- kechqurun: chuqur material — namunaviy javob tahlili, baholash mezonlari,
  tipik xatolar yoki rasmiy imtihon yangiligi
- Haftada 1-2 ta post rasmiy imtihon tartibi/yangiliklariga bag'ishlansin.
- Mavzular ANIQ bo'lsin: "Grammatika" emas, balki
  "Present Perfect vs Past Simple: Writing Task 2 da qaysi biri kerak".
- Mavzular xilma-xil bo'lsin, bir xil narsani takrorlama.

FAQAT JSON massiv qaytar:
[
  {{"day_offset": 0, "slot": "ertalab", "topic": "aniq mavzu", "content_type": "grammatika"}},
  ...
]
day_offset: 0=dushanba ... 6=yakshanba. slot nomlari aynan: {", ".join(slots)}."""


STYLE_PROMPT = """Quyida bir Telegram kanalining avvalgi postlari berilgan.
Ularni tahlil qilib, kanal uslubi bo'yicha qo'llanma yoz.

POSTLAR:
{samples}

FAQAT JSON qaytar:
{{
  "tone": "ovoz ohangi qanday (rasmiy/do'stona/o'qituvchona)",
  "structure": "postlar qanday tuzilgan — sarlavha, abzatslar, ro'yxatlar",
  "length": "o'rtacha uzunlik va abzatslar soni",
  "emoji_usage": "emoji qanday ishlatilgan",
  "language": "qaysi til(lar), aralashuv qanday",
  "hashtags": "hashtag odati",
  "cta": "post oxiri qanday tugaydi",
  "recurring_topics": ["takrorlanuvchi mavzular"],
  "style_guide": "6-10 qatorli aniq qo'llanma — yangi post shu uslubda yozilishi uchun"
}}"""
