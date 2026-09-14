import { ImageResponse } from "next/og";
import { SITE } from "@/content/site";

export const runtime = "nodejs";
export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #050a17 0%, #0d1a3a 100%)",
          color: "#f5f8ff",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", right: -60, top: -80, width: 520, height: 520, borderRadius: 999, background: "#3d8bff", opacity: 0.28 }} />
        <div style={{ position: "absolute", right: 200, bottom: -120, width: 360, height: 360, borderRadius: 999, background: "#2fd67f", opacity: 0.3 }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: "#2fd67f", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg viewBox="0 0 100 100" width="40" height="40" fill="#050a17">
                <ellipse cx="50" cy="66" rx="27" ry="21" /><circle cx="19" cy="41" r="10" /><circle cx="39" cy="26" r="11" /><circle cx="61" cy="26" r="11" /><circle cx="81" cy="41" r="10" />
              </svg>
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: 2 }}>STEP SCHOOL KIDS</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 820 }}>
            <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 0.98, letterSpacing: -2 }}>7–12 yoshdagi bolalar uchun ingliz tili</div>
            <div style={{ fontSize: 32, color: "rgba(245,248,255,0.7)" }}>Riko bilan 4 kitob · 1 yil · 156 dars</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ background: "#2fd67f", color: "#050a17", borderRadius: 999, padding: "18px 34px", fontSize: 28, fontWeight: 700 }}>Bepul sinov darsi</div>
            <div style={{ fontSize: 26, color: "rgba(245,248,255,0.5)" }}>{SITE.domain}</div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
