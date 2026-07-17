"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { cn } from "@/lib/utils";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const bgOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center bg-background text-foreground overflow-hidden py-24 px-4 sm:px-6 lg:px-8"
    >
      {/* Subtle dot grid */}
      <motion.div className="absolute inset-0 dot-pattern opacity-20" style={{ opacity: bgOpacity }} />

      {/* Glow behind card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none">
        <div
          className="w-full h-full rounded-full"
          style={{
            background: "radial-gradient(ellipse at center, oklch(0.75 0.12 80 / 0.05), transparent 70%)",
          }}
        />
      </div>

      {/* Business Card with Viewfinder */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-lg lg:max-w-xl mx-auto aspect-[1.58/1]"
      >
        <div className="relative bg-[oklch(0.12 0 0)] border border-white/10 overflow-hidden h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent" />
          <div className="absolute inset-0 p-8 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-white">Sarah Jenkins</h3>
                <p className="text-xs text-white/40 uppercase tracking-[0.2em] mt-1">VP of Engineering</p>
              </div>
              <div className="w-12 h-12 bg-white/10 border border-white/10 flex items-center justify-center">
                <span className="font-bold text-sm text-white/70">NX</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-end border-b border-white/5 pb-2">
                <span className="text-[10px] text-white/30 uppercase tracking-[0.2em]">Company</span>
                <span className="text-sm text-white/60">Nexus Industries</span>
              </div>
              <div className="flex justify-between items-end border-b border-white/5 pb-2">
                <span className="text-[10px] text-white/30 uppercase tracking-[0.2em]">Email</span>
                <span className="text-sm text-white/60">s.jenkins@nexus.io</span>
              </div>
              <div className="flex justify-between items-end border-b border-white/5 pb-2">
                <span className="text-[10px] text-white/30 uppercase tracking-[0.2em]">Phone</span>
                <span className="text-sm text-white/60">+1 (415) 555-0198</span>
              </div>
            </div>
          </div>

          {/* Viewfinder overlay */}
          <div className="absolute inset-0 pointer-events-none z-20">
            <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-primary" />
            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-primary" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-primary" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-primary" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-primary rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-px bg-primary/60" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-px bg-primary/60" />
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-4 text-[9px] font-mono text-primary/80 uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                REC
              </div>
              <div>F/2.8</div>
              <div>ISO 400</div>
            </div>
          </div>

          {/* Scanner laser sweep on load */}
          <motion.div
            className="absolute left-0 right-0 h-[2px] z-30 pointer-events-none"
            style={{
              background: "var(--primary)",
              boxShadow: "0 0 20px 4px oklch(0.75 0.12 80 / 0.5)",
            }}
            initial={{ top: "-5%", opacity: 0 }}
            animate={{ top: ["0%", "105%"], opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 2,
              delay: 0.8,
              ease: [0.16, 1, 0.3, 1],
              repeat: 0,
            }}
          />
        </div>
      </motion.div>

      {/* Headline below card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mt-12 sm:mt-16 text-center"
      >
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[0.95] mb-5 sm:mb-6">
          Scan any card
          <br />
          <span className="text-gradient">in 2 seconds.</span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto mb-8 sm:mb-10"
        >
          AI-powered OCR. Zero manual entry. From paper to pipeline instantly.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <MagneticButton>
            <Link
              href="/register"
              className={cn(
                buttonVariants({ size: "lg" }),
                "btn-gradient h-12 sm:h-14 px-8 sm:px-10 text-sm sm:text-base tracking-wide"
              )}
            >
              Try it free
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-3" />
            </Link>
          </MagneticButton>
        </motion.div>
      </motion.div>
    </section>
  );
}
