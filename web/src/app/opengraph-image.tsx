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
          background: "linear-gradient(135deg, #fff8ec 0%, #fdefd6 100%)",
          color: "#14232b",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", right: -60, top: -80, width: 520, height: 520, borderRadius: 999, background: "#23a867", opacity: 0.16 }} />
        <div style={{ position: "absolute", right: 200, bottom: -120, width: 360, height: 360, borderRadius: 999, background: "#ffc233", opacity: 0.35 }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: "#14232b", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg viewBox="0 0 100 120" width="38" height="46" fill="#ffc233">
                <ellipse cx="50" cy="88" rx="27" ry="23" /><ellipse cx="50" cy="40" rx="11.5" ry="27" />
                <ellipse cx="23" cy="54" rx="11" ry="25" transform="rotate(-30 23 54)" /><ellipse cx="77" cy="54" rx="11" ry="25" transform="rotate(30 77 54)" />
              </svg>
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: 2 }}>STEP SCHOOL KIDS</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 820 }}>
            <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 0.98, letterSpacing: -2 }}>7–12 yoshdagi bolalar uchun ingliz tili</div>
            <div style={{ fontSize: 32, color: "#40515a" }}>Riko bilan 4 kitob · 1 yil · 156 dars</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ background: "#ff6a3d", color: "#fff", borderRadius: 999, padding: "18px 34px", fontSize: 28, fontWeight: 700 }}>Bepul sinov darsi</div>
            <div style={{ fontSize: 26, color: "#6f7f87" }}>{SITE.domain}</div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
