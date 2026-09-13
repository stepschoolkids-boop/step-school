export type Benefit = {
  number: string;
  title: string;
  text: string;
  icon: "books" | "uz" | "play" | "age";
};

export const BENEFITS: Benefit[] = [
  {
    number: "01",
    icon: "books",
    title: "4 kitob = 1 tizimli yo‘l",
    text: "Har bir kitob keyingi qadam. Bola bugun nimani o‘rganayotganini va bir yildan keyin qayerga yetishini siz ham, u ham aniq bilasiz.",
  },
  {
    number: "02",
    icon: "uz",
    title: "Ingliz tili — o‘zbekcha izoh bilan",
    text: "Grammatika qoidalari ostida o‘zbekcha tushuntirish. Riko va do‘sti qoidani dialogda ochib beradi — bola tushunmay qolmaydi.",
  },
  {
    number: "03",
    icon: "play",
    title: "Hikoya, o‘yin va harakat orqali",
    text: "Har darsda hikoya, so‘z o‘yinlari, bo‘yash sahifalari va harakatli tanaffuslar. 90 daqiqa bola uchun uzoq tuyulmaydi.",
  },
  {
    number: "04",
    icon: "age",
    title: "Aynan 7–12 yosh uchun",
    text: "Dastur, dars uzunligi va o‘qituvchilarni baholash mezonlari — barchasi bolalar bilan ishlash xususiyatlariga moslangan.",
  },
];
