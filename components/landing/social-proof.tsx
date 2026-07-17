"use client";

import { useInView } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

const logos = [
  "Vertex",
  "Nexus",
  "Apex Labs",
  "Quantum",
  "Helios",
  "Pulse AI",
  "Orbit",
  "Stratos",
  "Zenith",
  "Forge",
];

export function SocialProof() {
  const { ref, isInView } = useInView();

  return (
    <section className="py-24 bg-background border-y border-border/50 overflow-hidden">
      {/* Logo ticker */}
      <div className="mb-20">
        <p className="text-center text-xs text-muted-foreground uppercase tracking-widest mb-10">
          Trusted by teams everywhere
        </p>
        <div className="relative w-full overflow-hidden">
          {/* Gradient masks */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

          {/* Single ticker with duplicated logos — translateX(-50%) scrolls one full set */}
          <div className="ticker flex items-center gap-12 w-max">
            {[...logos, ...logos].map((logo, i) => (
              <span
                key={`${logo}-${i}`}
                className="text-xl font-bold text-white/15 tracking-tight shrink-0 select-none"
              >
                {logo}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonial */}
      <div
        ref={ref}
        className={cn(
          "max-w-3xl mx-auto px-4 sm:px-6 text-center animate-fade-in-up",
          isInView && "visible"
        )}
      >
        <blockquote className="font-heading text-xl sm:text-2xl md:text-3xl leading-relaxed text-foreground/80 mb-8">
          &ldquo;We went from a shoebox of business cards to a structured
          pipeline in a week. The scanning accuracy is genuinely
          impressive.&rdquo;
        </blockquote>
        <div className="flex items-center justify-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-xs font-bold text-white/60">
            SC
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-foreground">
              Sarah Chen
            </div>
            <div className="text-xs text-muted-foreground">
              VP Sales, Vertex
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
