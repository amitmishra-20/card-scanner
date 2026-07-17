import { MarketingNavbar } from "@/components/landing/marketing-navbar";
import { Hero } from "@/components/landing/hero";
import { ScrollStory } from "@/components/landing/scroll-story";
import { SocialProof } from "@/components/landing/social-proof";
import { BentoGrid } from "@/components/landing/bento-features";
import { ProductShowcase } from "@/components/landing/product-showcase";
import { Waitlist } from "@/components/landing/pricing-cards";
import { Faq } from "@/components/landing/faq";
import { CTA } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 bg-black font-sans">
      <MarketingNavbar />
      <main className="w-full relative z-10">
        <Hero />
        <div className="relative z-0"><ScrollStory /></div>
        <SocialProof />
        <BentoGrid />
        <ProductShowcase />
        <Waitlist />
        <Faq />
        <CTA />
        <Footer />
      </main>
    </div>
  );
}
