// ============================================
// CardScan Pro — TypeScript Types & Interfaces
// ============================================

// --- Lead Status ---
export const LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "LOST",
  "CONVERTED",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

// --- Plan Names ---
export const PLAN_NAMES = ["FREE", "PRO", "ENTERPRISE"] as const;
export type PlanName = (typeof PLAN_NAMES)[number];

// --- Subscription Status ---
export const SUBSCRIPTION_STATUSES = [
  "ACTIVE",
  "CANCELLED",
  "PAST_DUE",
] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

// --- Extracted Card Data (from Gemini) ---
export interface ExtractedCardData {
  name: string | null;
  designation: string | null;
  company: string | null;
  emails: string[];
  phones: string[];
  websites: string[];
  address: string | null;
}

// --- Lead ---
export interface Lead {
  id: string;
  userId: string;
  name: string | null;
  designation: string | null;
  company: string | null;
  emails: string[];
  phones: string[];
  websites: string[];
  address: string | null;
  notes: string | null;
  status: LeadStatus;
  createdAt: Date;
  updatedAt: Date;
}

// --- Plan ---
export interface Plan {
  id: string;
  name: PlanName;
  displayName: string;
  price: number; // in cents
  scanLimit: number; // -1 for unlimited
  interval: string;
  features: string[];
  stripeProductId: string | null;
  stripePriceId: string | null;
}

// --- Subscription ---
export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  plan?: Plan;
  status: SubscriptionStatus;
  stripeSubscriptionId: string | null;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  createdAt: Date;
}

// --- Scan Usage ---
export interface ScanUsage {
  id: string;
  userId: string;
  count: number;
  month: number;
  year: number;
}

// --- Dashboard Stats ---
export interface DashboardStats {
  totalLeads: number;
  newLeadsThisMonth: number;
  scansThisMonth: number;
  scanLimit: number;
  conversionRate: number;
  leadsByStatus: { status: LeadStatus; count: number }[];
  leadsOverTime: { date: string; count: number }[];
  recentLeads: Lead[];
}

// --- Server Action Response ---
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// --- User Profile ---
export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  plan: PlanName;
  scansUsed: number;
  scanLimit: number;
}
