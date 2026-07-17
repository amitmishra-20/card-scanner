"use client";

import { ChevronDown } from "lucide-react";
import { useInView } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

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
}: {
  question: string;
  answer: string;
}) {
  return (
    <details className="group faq-item">
      <summary className="w-full flex items-center justify-between py-6 text-left cursor-pointer group-hover:text-primary transition-colors pr-4 list-none [&::-webkit-details-marker]:hidden">
        <span className="text-lg font-medium text-foreground group-hover:text-primary transition-colors pr-4">
          {question}
        </span>
        <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <p className="pb-6 text-muted-foreground leading-relaxed">{answer}</p>
    </details>
  );
}

export function Faq() {
  const { ref: headingRef, isInView: headingVisible } = useInView();
  const { ref: listRef, isInView: listVisible } = useInView();

  return (
    <section id="faq" className="py-24 bg-background border-t border-border/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={headingRef}
          className={cn(
            "text-center mb-16 animate-fade-in-up",
            headingVisible && "visible"
          )}
        >
          <h2 className="font-heading text-4xl md:text-5xl tracking-tight mb-4">
            Questions?
          </h2>
          <p className="text-lg text-muted-foreground">
            We&apos;ve got answers.
          </p>
        </div>

        <div
          ref={listRef}
          className={cn(
            "animate-fade-in-up",
            listVisible && "visible"
          )}
        >
          {faqs.map((faq, i) => (
            <FaqItem key={i} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}
