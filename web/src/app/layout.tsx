import type { Metadata, Viewport } from "next";
import { Manrope, Unbounded } from "next/font/google";
import { CONTACT, SITE, telegramHref } from "@/content/site";
import "./globals.css";

const display = Unbounded({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const body = Manrope({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "Step School Kids",
    "bolalar uchun ingliz tili",
    "7-12 yosh ingliz tili",
    "ingliz tili kurslari bolalar",
    "Riko",
    "English for kids Uzbekistan",
  ],
  applicationName: SITE.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
  category: "education",
};

export const viewport: Viewport = {
  themeColor: "#050a17",
  width: "device-width",
  initialScale: 1,
};

function jsonLd() {
  const sameAs = [
    CONTACT.telegramUsername ? telegramHref(CONTACT.telegramUsername) : null,
    CONTACT.instagramUrl,
  ].filter(Boolean);

  // Only verified facts. No address until it is confirmed.
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    slogan: SITE.motto,
    ...(CONTACT.phone ? { telephone: CONTACT.phone } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    address: { "@type": "PostalAddress", addressCountry: SITE.countryCode },
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "student",
      audienceType: "children aged 7–12",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Kids English — 4 kitob, 1 yil, 156 dars",
      itemListElement: ["Start, Riko!", "Speak, Riko!", "Read, Riko!", "Win, Riko!"].map((n, i) => ({
        "@type": "Course",
        position: i + 1,
        name: n,
        provider: { "@type": "EducationalOrganization", name: SITE.name },
      })),
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uz" className={`${display.variable} ${body.variable}`}>
      <body>
        <a href="#asosiy" className="skip-link">
          Asosiy qismga o‘tish
        </a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }}
        />
      </body>
    </html>
  );
}
