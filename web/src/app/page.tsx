import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { FootprintJourney } from "@/components/sections/FootprintJourney";
import { Benefits } from "@/components/sections/Benefits";
import { BooksShowcase } from "@/components/sections/BooksShowcase";
import { CurriculumTimeline } from "@/components/sections/CurriculumTimeline";
import { LessonFlow } from "@/components/sections/LessonFlow";
import { Teachers } from "@/components/sections/Teachers";
import { TrustSection } from "@/components/sections/TrustSection";
import { Schedule } from "@/components/sections/Schedule";
import { TrialForm } from "@/components/sections/TrialForm";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { MobileCtaBar } from "@/components/sections/MobileCtaBar";

/**
 * Homepage = one scrolling story:
 * STEP → DISCOVER → SPEAK → READ → WIN, with Riko as the guide
 * and the trial-lesson form as the destination.
 */
export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="asosiy">
        <Hero />
        <FootprintJourney />
        <Benefits />
        <BooksShowcase />
        <CurriculumTimeline />
        <LessonFlow />
        <Teachers />
        <TrustSection />
        <Schedule />
        <TrialForm />
        <Contact />
      </main>
      <Footer />
      <MobileCtaBar />
    </>
  );
}
