"use client";

import { motion } from "framer-motion";
import { Shield, Zap, FileDown, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant Scan",
    value: "0.3s",
    description: "From photo to structured data in under a second.",
  },
  {
    icon: Shield,
    title: "Secure",
    value: "AES-256",
    description: "Bank-grade encryption. Your data stays yours.",
  },
  {
    icon: FileDown,
    title: "Export",
    value: "CSV & API",
    description: "Push leads straight to your CRM or spreadsheet.",
  },
  {
    icon: BarChart3,
    title: "Pipeline",
    value: "Visual",
    description: "Track every lead from scan to close.",
  },
];

export function BentoGrid() {
  return (
    <section id="features" className="py-24 bg-background border-t border-border/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-4xl md:text-5xl tracking-tight mb-4">
            Built for <span className="text-primary">speed</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Every feature designed to get you from card to close faster.
          </p>
        </motion.div>

        {/* Desktop: 2x3 clean grid */}
        <div className="hidden md:grid grid-cols-3 gap-4">
          {/* Hero cell — accuracy, spans 2 rows */}
          <motion.div
            className="row-span-2 glass p-8 flex flex-col justify-between hover:border-white/10 hover:bg-[oklch(0.10 0 0)] transition-all duration-300 cursor-default"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <div className="text-xs font-mono text-primary/60 uppercase tracking-widest mb-3">
                Accuracy
              </div>
              <div className="text-6xl font-black tracking-tighter text-primary mb-3">
                99.9%
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                Our vision model reads handwritten notes, obscure fonts, and damaged cards.
              </p>
            </div>
            <div className="mt-8 space-y-2">
              {["Printed text", "Handwriting", "Damaged cards", "QR codes"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-white/40">
                  <div className="w-1 h-1 bg-primary rounded-full" />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          {/* 4 small cells */}
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="glass p-6 flex flex-col justify-center hover:border-white/10 hover:bg-[oklch(0.10 0 0)] transition-all duration-300 cursor-default"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i + 1) * 0.08 }}
            >
              <f.icon className="w-5 h-5 text-primary mb-3" />
              <div className="text-xs font-mono text-primary/60 uppercase tracking-widest mb-1">
                {f.title}
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">{f.value}</div>
              <p className="text-xs text-muted-foreground">{f.description}</p>
            </motion.div>
          ))}

          {/* Wide bottom cell */}
          <motion.div
            className="col-span-2 glass p-6 overflow-hidden hover:border-white/10 hover:bg-[oklch(0.10 0 0)] transition-all duration-300 cursor-default"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="text-xs font-mono text-primary/60 uppercase tracking-widest mb-3">
              Universal
            </div>
            <div className="text-lg font-bold text-foreground mb-4">
              Works with any business card
            </div>
            <div className="flex gap-3">
              {[
                { name: "Design Co.", role: "Creative Director" },
                { name: "Tech Labs", role: "CTO" },
                { name: "Global Inc.", role: "Head of Sales" },
                { name: "Startup HQ", role: "Founder" },
              ].map((card) => (
                <div
                  key={card.name}
                  className="shrink-0 bg-white/[0.03] border border-white/5 px-4 py-3"
                >
                  <div className="text-sm font-semibold text-white/70">{card.name}</div>
                  <div className="text-[10px] text-white/30 mt-0.5">{card.role}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Mobile: Stacked */}
        <div className="md:hidden space-y-4">
          <div className="glass p-8 hover:border-white/10 hover:bg-[oklch(0.10 0 0)] transition-all duration-300">
            <div className="text-xs font-mono text-primary/60 uppercase tracking-widest mb-2">Accuracy</div>
            <div className="text-5xl font-black tracking-tighter text-primary mb-2">99.9%</div>
            <p className="text-sm text-muted-foreground">Reads any card, any font, any condition.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {features.map((f) => (
              <div key={f.title} className="glass p-5 hover:border-white/10 hover:bg-[oklch(0.10 0 0)] transition-all duration-300">
                <f.icon className="w-4 h-4 text-primary mb-2" />
                <div className="text-lg font-bold text-foreground">{f.value}</div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{f.description}</p>
              </div>
            ))}
          </div>
          <div className="bg-[oklch(0.08 0 0)] border border-white/5 p-5 hover:border-white/10 hover:bg-[oklch(0.10 0 0)] transition-all duration-300">
            <div className="text-sm font-bold text-foreground mb-2">Works with any card</div>
            <div className="flex gap-2 overflow-hidden">
              {["Design Co.", "Tech Labs", "Global Inc.", "Startup HQ"].map((c) => (
                <div key={c} className="shrink-0 bg-white/[0.03] border border-white/5 px-3 py-2 text-xs text-white/50">
                  {c}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
