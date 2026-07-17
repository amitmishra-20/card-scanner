"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How accurate is the card scanning?",
    answer:
      "Our AI-powered vision model achieves 99.9% accuracy across printed text, handwriting, damaged cards, and QR codes. It handles obscure fonts, non-standard layouts, and multi-language cards with ease.",
  },
  {
    question: "What card formats are supported?",
    answer:
      "Any business card photo works — front or back, vertical or horizontal, standard or non-standard sizes. Just snap a photo or upload an image and our AI handles the rest.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. All contact data is encrypted at rest using AES-256 encryption. We never use your data to train external models, and your contacts remain your property. We're SOC 2 compliant.",
  },
  {
    question: "Can I import existing contacts?",
    answer:
      "You can manually add contacts or scan business cards to populate your pipeline. CSV import and CRM integrations are on our roadmap — join the waitlist for updates.",
  },
  {
    question: "What happens after the free trial?",
    answer:
      "The Free tier stays free forever with 5 scans per month. Pro plans with higher limits are coming soon — join the waitlist to get early access and a discount.",
  },
  {
    question: "Do you support international cards?",
    answer:
      "Yes. Our AI supports multi-language OCR including English, Spanish, French, German, Japanese, Chinese, Korean, and more. It recognizes international phone formats and address structures.",
  },
  {
    question: "Can I export my leads?",
    answer:
      "CSV export is coming soon as part of our Pro plan. You can currently manage and track all your leads directly in the app. Join the waitlist to be notified when export launches.",
  },
];

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="faq-item">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-6 text-left group"
      >
        <span className="text-lg font-medium text-foreground group-hover:text-primary transition-colors pr-4">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-muted-foreground leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-background border-t border-border/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-4xl md:text-5xl tracking-tight mb-4">
            Questions?
          </h2>
          <p className="text-lg text-muted-foreground">
            We&apos;ve got answers.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          {faqs.map((faq, i) => (
            <FaqItem
              key={i}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
