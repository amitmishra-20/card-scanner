"use client";

import dynamic from "next/dynamic";

const ScrollStory = dynamic(
  () => import("@/components/landing/scroll-story").then((m) => m.ScrollStory),
  { ssr: false }
);
const SocialProof = dynamic(
  () => import("@/components/landing/social-proof").then((m) => m.SocialProof),
  { ssr: true }
);
const BentoGrid = dynamic(
  () => import("@/components/landing/bento-features").then((m) => m.BentoGrid),
  { ssr: true }
);
const ProductShowcase = dynamic(
  () =>
    import("@/components/landing/product-showcase").then(
      (m) => m.ProductShowcase
    ),
  { ssr: false }
);
const Waitlist = dynamic(
  () => import("@/components/landing/pricing-cards").then((m) => m.Waitlist),
  { ssr: false }
);
const Faq = dynamic(
  () => import("@/components/landing/faq").then((m) => m.Faq),
  { ssr: false }
);
const CTA = dynamic(
  () => import("@/components/landing/cta").then((m) => m.CTA),
  { ssr: false }
);

export function LandingSections() {
  return (
    <>
      <ScrollStory />
      <SocialProof />
      <BentoGrid />
      <ProductShowcase />
      <Waitlist />
      <Faq />
      <CTA />
    </>
  );
}
