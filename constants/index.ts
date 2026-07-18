// ============================================
// CardScan Pro — Constants
// ============================================

import {
  LayoutDashboard,
  ScanLine,
  Users,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { LeadStatus } from "@/types";

// --- Navigation ---
export const APP_NAV_ITEMS: {
  title: string;
  href: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Scan Card",
    href: "/scan",
    icon: ScanLine,
  },
  {
    title: "Leads",
    href: "/leads",
    icon: Users,
  },
  {
    title: "Account",
    href: "/account",
    icon: Settings,
  },
];

// --- Lead Status Config ---
export const LEAD_STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; color: string; bgClass: string; textClass: string }
> = {
  NEW: {
    label: "New",
    color: "#6C5CE7",
    bgClass: "bg-purple-500/15",
    textClass: "text-purple-400",
  },
  CONTACTED: {
    label: "Contacted",
    color: "#4FC3F7",
    bgClass: "bg-sky-500/15",
    textClass: "text-sky-400",
  },
  QUALIFIED: {
    label: "Qualified",
    color: "#00D4AA",
    bgClass: "bg-emerald-500/15",
    textClass: "text-emerald-400",
  },
  LOST: {
    label: "Lost",
    color: "#FF5370",
    bgClass: "bg-red-500/15",
    textClass: "text-red-400",
  },
  CONVERTED: {
    label: "Converted",
    color: "#FFB74D",
    bgClass: "bg-amber-500/15",
    textClass: "text-amber-400",
  },
};

// --- AI Prompt ---
export const CARD_EXTRACTION_PROMPT = `You are a business card data extractor. Analyze the business card image and extract ALL visible contact information.

Return ONLY valid JSON in this exact format (no markdown, no code fences):
{
  "name": "Full Name",
  "designation": "Job Title / Designation",
  "company": "Company Name",
  "emails": ["email1@example.com"],
  "phones": ["+1-234-567-8900"],
  "websites": ["https://example.com"],
  "address": "Full Address as single string"
}

Rules:
- If a field is not found, use null for strings and [] for arrays
- Phone numbers should include country code if visible
- Include ALL emails, phones, and websites found (as arrays)
- Do not guess or fabricate information
- Return ONLY the JSON object, nothing else`;

// --- App Metadata ---
export const APP_NAME = "CardScan Pro";

// --- AI MIME Types ---
export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
