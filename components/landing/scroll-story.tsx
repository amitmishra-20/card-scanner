"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

const steps = [
  {
    step: "01",
    headline: "Snap.",
    description: "Point your camera at any business card.",
  },
  {
    step: "02",
    headline: "Extract.",
    description: "AI reads every detail in milliseconds.",
  },
  {
    step: "03",
    headline: "Know.",
    description: "From card to pipeline in one tap.",
  },
];

function SnapVisual({ opacity }: { opacity: MotionValue<number> }) {
  return (
    <motion.div
      className="relative w-full max-w-md aspect-[1.58/1]"
      style={{ opacity }}
    >
      {/* Glow */}
      <div
        className="absolute -inset-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, oklch(0.75 0.12 80 / 0.05), transparent 70%)",
        }}
      />

      {/* Business card */}
      <div className="absolute inset-0 bg-[oklch(0.12 0 0)] border border-white/10 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-white/4 via-transparent to-transparent" />
        <div className="absolute inset-0 p-8 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-white">
                Sarah Jenkins
              </h3>
              <p className="text-xs text-white/40 uppercase tracking-[0.2em] mt-1">
                VP of Engineering
              </p>
            </div>
            <div className="w-12 h-12 bg-white/10 border border-white/10 flex items-center justify-center">
              <span className="font-bold text-sm text-white/70">NX</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-end border-b border-white/5 pb-2">
              <span className="text-[10px] text-white/30 uppercase tracking-[0.2em]">
                Company
              </span>
              <span className="text-sm text-white/60">Nexus Industries</span>
            </div>
            <div className="flex justify-between items-end border-b border-white/5 pb-2">
              <span className="text-[10px] text-white/30 uppercase tracking-[0.2em]">
                Email
              </span>
              <span className="text-sm text-white/60">
                s.jenkins@nexus.io
              </span>
            </div>
            <div className="flex justify-between items-end border-b border-white/5 pb-2">
              <span className="text-[10px] text-white/30 uppercase tracking-[0.2em]">
                Phone
              </span>
              <span className="text-sm text-white/60">
                +1 (415) 555-0198
              </span>
            </div>
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
    </motion.div>
  );
}

function ExtractVisual({ opacity }: { opacity: MotionValue<number> }) {
  return (
    <motion.div
      className="relative w-full max-w-md aspect-[1.58/1]"
      style={{ opacity }}
    >
      <div className="absolute inset-0 bg-[oklch(0.12 0 0)] border border-white/10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent" />
        <div className="absolute inset-0 p-8 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-white">
                Sarah Jenkins
              </h3>
              <p className="text-xs text-white/40 uppercase tracking-[0.2em] mt-1">
                VP of Engineering
              </p>
            </div>
            <div className="w-12 h-12 bg-white/10 border border-white/10 flex items-center justify-center">
              <span className="font-bold text-sm text-white/70">NX</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-end border-b border-white/5 pb-2">
              <span className="text-[10px] text-white/30 uppercase tracking-[0.2em]">
                Company
              </span>
              <span className="text-sm text-white/60">Nexus Industries</span>
            </div>
            <div className="flex justify-between items-end border-b border-white/5 pb-2">
              <span className="text-[10px] text-white/30 uppercase tracking-[0.2em]">
                Email
              </span>
              <span className="text-sm text-white/60">
                s.jenkins@nexus.io
              </span>
            </div>
            <div className="flex justify-between items-end border-b border-white/5 pb-2">
              <span className="text-[10px] text-white/30 uppercase tracking-[0.2em]">
                Phone
              </span>
              <span className="text-sm text-white/60">
                +1 (415) 555-0198
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI extraction overlay */}
      <div className="absolute -right-4 top-1/2 -translate-y-1/2 space-y-3 w-[200px]">
        {[
          { label: "Name", value: "Sarah Jenkins" },
          { label: "Email", value: "s.jenkins@nexus.io" },
          { label: "Phone", value: "+1 (415) 555-0198" },
          { label: "Company", value: "Nexus Industries" },
        ].map((field, i) => (
          <motion.div
            key={field.label}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ delay: i * 0.15, duration: 0.4 }}
          >
            <div className="text-[10px] text-primary/60 uppercase tracking-[0.2em] mb-1">
              {field.label}
            </div>
            <div className="text-sm font-semibold text-white border-b border-white/10 pb-1">
              {field.value}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function KnowVisual({ opacity }: { opacity: MotionValue<number> }) {
  return (
    <motion.div
      className="relative w-full max-w-md space-y-5"
      style={{ opacity }}
    >
      {/* Lead card */}
      <div className="bg-[oklch(0.12 0 0)] border border-white/10 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 bg-white/10 border border-white/10 flex items-center justify-center">
            <span className="font-bold text-xs text-white/70">SJ</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-white">
              Sarah Jenkins
            </div>
            <div className="text-xs text-white/40">
              VP of Engineering — Nexus Industries
            </div>
          </div>
        </div>
        <div className="flex gap-3 text-xs text-white/50">
          <span>s.jenkins@nexus.io</span>
          <span>·</span>
          <span>+1 (415) 555-0198</span>
        </div>
      </div>

      {/* Pipeline */}
      <div>
        <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-3">
          Pipeline Status
        </div>
        <div className="flex gap-1 h-2 bg-white/5 w-full mb-3">
          <div className="h-full bg-purple-500" style={{ width: "20%" }} />
          <div className="h-full bg-sky-500" style={{ width: "25%" }} />
          <div className="h-full bg-emerald-500" style={{ width: "25%" }} />
          <div className="h-full bg-primary" style={{ width: "30%" }} />
        </div>
        <div className="flex justify-between text-[10px] text-white/30">
          <span>New</span>
          <span>Contacted</span>
          <span>Qualified</span>
          <span>Converted</span>
        </div>
      </div>

      {/* Converted badge */}
      <div className="flex justify-center pt-2">
        <div className="px-6 py-2 bg-primary text-primary-foreground text-sm font-bold uppercase tracking-widest">
          Converted
        </div>
      </div>
    </motion.div>
  );
}

function ProgressIndicator({
  progress,
}: {
  progress: MotionValue<number>;
}) {
  const o1 = useTransform(progress, [0, 0.05, 0.28, 0.35], [0.3, 1, 1, 0.3]);
  const o2 = useTransform(
    progress,
    [0.3, 0.37, 0.63, 0.7],
    [0.3, 1, 1, 0.3]
  );
  const o3 = useTransform(progress, [0.65, 0.72, 0.95, 1], [0.3, 1, 1, 0.3]);
  const ops = [o1, o2, o3];

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
      {ops.map((op, i) => (
        <motion.div
          key={i}
          className="w-8 h-[2px] bg-primary"
          style={{ opacity: op }}
        />
      ))}
    </div>
  );
}

export function ScrollStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const s1Opacity = useTransform(
    scrollYProgress,
    [0, 0.05, 0.28, 0.35],
    [1, 1, 1, 0]
  );
  const s2Opacity = useTransform(
    scrollYProgress,
    [0.3, 0.37, 0.63, 0.7],
    [0, 1, 1, 0]
  );
  const s3Opacity = useTransform(
    scrollYProgress,
    [0.65, 0.72, 1, 1],
    [0, 1, 1, 1]
  );

  const s1Y = useTransform(scrollYProgress, [0, 0.28, 0.35], [
    "0%",
    "0%",
    "-5%",
  ]);
  const s2Y = useTransform(
    scrollYProgress,
    [0.3, 0.37, 0.63, 0.7],
    ["0%", "0%", "0%", "-5%"]
  );
  const s3Y = useTransform(scrollYProgress, [0.65, 0.72, 1, 1], [
    "0%",
    "0%",
    "0%",
    "0%",
  ]);

  const s1Visibility = useTransform(
    scrollYProgress,
    (v) => (v <= 0.37 ? "visible" : "hidden") as "visible" | "hidden"
  );
  const s2Visibility = useTransform(
    scrollYProgress,
    (v) =>
      (v >= 0.3 && v <= 0.72 ? "visible" : "hidden") as "visible" | "hidden"
  );
  const s3Visibility = useTransform(
    scrollYProgress,
    (v) => (v >= 0.67 ? "visible" : "hidden") as "visible" | "hidden"
  );

  return (
    <section
      ref={containerRef}
      className="relative h-[300vh]"
      style={{ isolation: "isolate" }}
    >
      <div className="sticky top-0 h-screen overflow-hidden flex items-center bg-background z-0">
        <div className="absolute inset-0 dot-pattern opacity-10" />

        {/* Section 1: Snap */}
        <motion.div
          className="absolute inset-0 flex items-center"
          style={{
            opacity: s1Opacity,
            y: s1Y,
            visibility: s1Visibility,
            pointerEvents: "none",
          }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 w-full items-center">
            <div>
              <div className="text-xs font-mono text-primary/60 uppercase tracking-widest mb-4">
                Step {steps[0].step}
              </div>
              <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-[0.9] mb-6">
                {steps[0].headline}
              </h2>
              <p className="text-lg text-muted-foreground max-w-md">
                {steps[0].description}
              </p>
            </div>
            <div className="flex justify-center lg:justify-end">
              <SnapVisual opacity={s1Opacity} />
            </div>
          </div>
        </motion.div>

        {/* Section 2: Extract */}
        <motion.div
          className="absolute inset-0 flex items-center"
          style={{
            opacity: s2Opacity,
            y: s2Y,
            visibility: s2Visibility,
            pointerEvents: "none",
          }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 w-full items-center">
            <div>
              <div className="text-xs font-mono text-primary/60 uppercase tracking-widest mb-4">
                Step {steps[1].step}
              </div>
              <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-[0.9] mb-6">
                {steps[1].headline}
              </h2>
              <p className="text-lg text-muted-foreground max-w-md">
                {steps[1].description}
              </p>
            </div>
            <div className="flex justify-center lg:justify-end">
              <ExtractVisual opacity={s2Opacity} />
            </div>
          </div>
        </motion.div>

        {/* Section 3: Know */}
        <motion.div
          className="absolute inset-0 flex items-center"
          style={{
            opacity: s3Opacity,
            y: s3Y,
            visibility: s3Visibility,
            pointerEvents: "none",
          }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 w-full items-center">
            <div>
              <div className="text-xs font-mono text-primary/60 uppercase tracking-widest mb-4">
                Step {steps[2].step}
              </div>
              <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-[0.9] mb-6">
                {steps[2].headline}
              </h2>
              <p className="text-lg text-muted-foreground max-w-md">
                {steps[2].description}
              </p>
            </div>
            <div className="flex justify-center lg:justify-end">
              <KnowVisual opacity={s3Opacity} />
            </div>
          </div>
        </motion.div>

        {/* Scroll progress indicator */}
        <ProgressIndicator progress={scrollYProgress} />
      </div>
    </section>
  );
}
