"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring, useMotionValueEvent, type MotionValue } from "framer-motion";

function StatNumber({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="text-center">
      <motion.div
        className="text-4xl sm:text-5xl font-black tracking-tighter text-foreground mb-1"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        {isInView ? (
          <CountUp target={value} suffix={suffix} />
        ) : (
          `0${suffix}`
        )}
      </motion.div>
      <div className="text-xs text-muted-foreground uppercase tracking-widest">{label}</div>
    </div>
  );
}

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 50, damping: 15 });
  const isInView = useInView(ref, { once: true });

  if (isInView) {
    motionVal.set(target);
  }

  return (
    <span ref={ref}>
      <MotionValueDisplay value={spring} suffix={suffix} />
    </span>
  );
}

function MotionValueDisplay({ value, suffix }: { value: MotionValue<number>; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useMotionValueEvent(value, "change", (latest: number) => {
    if (ref.current) {
      ref.current.textContent = `${Math.round(latest)}${suffix}`;
    }
  });

  return <span ref={ref}>0{suffix}</span>;
}

export function ProductShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [8, 4, 0]);

  return (
    <section ref={containerRef} className="py-24 bg-background overflow-hidden border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Browser mockup */}
        <motion.div
          className="max-w-4xl mx-auto mb-24"
          style={{ y, perspective: 1000 }}
        >
          <motion.div
            className="relative border border-white/10 rounded-lg overflow-hidden bg-[oklch(0.08 0 0)] shadow-2xl"
            style={{ rotateX, transformOrigin: "center bottom" }}
          >
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[oklch(0.06 0 0)]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-white/5 rounded px-3 py-1 text-[10px] text-white/30 font-mono">
                  cardscan.pro/dashboard
                </div>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Top stats row */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Total Leads", value: "1,247" },
                  { label: "This Month", value: "89" },
                  { label: "Converted", value: "34%" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/[0.02] border border-white/5 p-4">
                    <div className="text-[10px] text-white/30 uppercase tracking-widest mb-1">{stat.label}</div>
                    <div className="text-lg font-bold text-white">{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Recent leads */}
              <div className="bg-white/[0.02] border border-white/5 p-4">
                <div className="text-[10px] text-white/30 uppercase tracking-widest mb-3">Recent Scans</div>
                <div className="space-y-2">
                  {[
                    { name: "Sarah Jenkins", company: "Nexus Industries", status: "Qualified" },
                    { name: "Marcus Wei", company: "Forge Labs", status: "New" },
                    { name: "Elena Rodriguez", company: "Stratos", status: "Contacted" },
                  ].map((lead) => (
                    <div key={lead.name} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/50">
                          {lead.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-white/70">{lead.name}</div>
                          <div className="text-[10px] text-white/30">{lead.company}</div>
                        </div>
                      </div>
                      <div className="text-[10px] text-primary/70 uppercase tracking-wider">{lead.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Stat counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 max-w-3xl mx-auto">
          <StatNumber value={10000} suffix="+" label="Cards Scanned" />
          <StatNumber value={99} suffix=".9% Accuracy" label="AI Precision" />
          <StatNumber value={3} suffix="s Avg" label="Per Scan" />
        </div>
      </div>
    </section>
  );
}
