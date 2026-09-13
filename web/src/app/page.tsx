import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Journey } from "@/components/sections/Journey";
import { Books } from "@/components/sections/Books";
import { Stats } from "@/components/sections/Stats";
import { LessonTimeline } from "@/components/sections/LessonTimeline";
import { TrustBand } from "@/components/sections/TrustBand";
import { FinalCta } from "@/components/sections/FinalCta";
import { Footer } from "@/components/sections/Footer";
import { MobileCtaBar } from "@/components/sections/MobileCtaBar";

/**
 * One continuous story: STEP → START → SPEAK → READ → WIN.
 * Hero (cinematic entrance) → sticky journey → books → 1 year / 156 lessons →
 * 90-minute lesson → trust & terms → first step (form).
 */
export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="asosiy">
        <Hero />
        <Journey />
        <Books />
        <Stats />
        <LessonTimeline />
        <TrustBand />
        <FinalCta />
      </main>
      <Footer />
      <MobileCtaBar />
    </>
  );
}
