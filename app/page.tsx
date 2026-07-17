import { MarketingNavbar } from "@/components/landing/marketing-navbar";
import { Hero } from "@/components/landing/hero";
import { Footer } from "@/components/landing/footer";
import { LandingSections } from "@/components/landing/landing-sections";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 bg-black font-sans">
      <MarketingNavbar />
      <main className="w-full relative z-10">
        <Hero />
        <div className="relative z-0">
          <LandingSections />
        </div>
        <Footer />
      </main>
    </div>
  );
}
