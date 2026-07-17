"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { joinWaitlist } from "@/actions/waitlist";

const features = [
  "AI-powered card scanning",
  "Smart lead pipeline",
  "CSV export",
  "Priority support",
];

export function Waitlist() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    const res = await joinWaitlist(email);
    setIsSubmitting(false);

    if (res.success) {
      setIsSubmitted(true);
      toast.success(res.data?.message || "You're on the list!");
    } else {
      toast.error(res.error || "Failed to join waitlist");
    }
  };

  return (
    <section id="pricing" className="py-24 bg-background border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="font-heading text-4xl md:text-5xl tracking-tight mb-4">
            Pro plans are{" "}
            <span className="text-primary">coming soon</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Join the waitlist for higher scan limits, CSV export, and priority support.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-lg mx-auto"
        >
          <div className="relative flex flex-col p-8 border border-primary/30 bg-[oklch(0.08 0 0)]">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary" />

            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                Early Access
              </span>
            </div>

            <h3 className="text-2xl font-bold mb-2 text-foreground">
              Pro Plan Waitlist
            </h3>
            <p className="text-muted-foreground mb-6">
              Be first in line when we launch. Early members get 3 months at 50% off.
            </p>

            <ul className="space-y-3 mb-8">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            {isSubmitted ? (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <p className="text-sm text-foreground">
                  You&apos;re on the list! We&apos;ll email you at <strong>{email}</strong> when we launch.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-background/50 focus:bg-background"
                />
                <Button
                  type="submit"
                  className="btn-gradient px-6 shrink-0"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Join Waitlist"
                  )}
                </Button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
