"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { useInView } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

export function CTA() {
  const { ref, isInView } = useInView();

  return (
    <section className="py-24 relative overflow-hidden bg-primary text-primary-foreground">
      {/* Subtle card silhouette watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
        <div className="w-[500px] aspect-[1.58/1] border-[3px] border-black rounded-sm -rotate-6" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div
          ref={ref}
          className={cn(
            "animate-fade-in-up",
            isInView && "visible"
          )}
        >
          <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl tracking-tight mb-8 leading-[0.95]">
            Your next contact
            <br />
            is in your hand.
          </h2>
          <p className="text-lg max-w-xl mx-auto mb-12 opacity-80">
            Join thousands of professionals who stopped typing and started
            scanning.
          </p>

          <MagneticButton>
            <Link
              href="/register"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-14 px-10 text-base tracking-wide bg-black text-white hover:bg-black/80 border border-black"
              )}
            >
              Start scanning free
              <ArrowRight className="w-5 h-5 ml-3" />
            </Link>
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
