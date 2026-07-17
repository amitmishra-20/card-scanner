// ============================================
// CardScan Pro — Scan Service
// ============================================

import { db } from "@/lib/db";
import { extractCardFromImage } from "@/lib/gemini";
import type { ExtractedCardData } from "@/types";

/**
 * Extract card data using Gemini AI
 */
export async function extractCard(
  base64Image: string,
  mimeType: string = "image/jpeg"
): Promise<ExtractedCardData> {
  return extractCardFromImage(base64Image, mimeType);
}

/**
 * Check if user has remaining scan quota
 */
export async function checkScanQuota(userId: string): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  planName: string;
}> {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Get user's subscription with plan
  const subscription = await db.subscription.findUnique({
    where: { userId },
    include: { plan: true },
  });

  // Default to free plan limits if no subscription
  const plan = subscription?.plan;
  const scanLimit = plan?.scanLimit ?? 5;
  const planName = plan?.name ?? "FREE";

  // Unlimited plan
  if (scanLimit === -1) {
    return { allowed: true, used: 0, limit: -1, planName };
  }

  // Get current month's usage
  const usage = await db.scanUsage.findUnique({
    where: {
      userId_month_year: {
        userId,
        month: currentMonth,
        year: currentYear,
      },
    },
  });

  const used = usage?.count ?? 0;

  return {
    allowed: used < scanLimit,
    used,
    limit: scanLimit,
    planName,
  };
}

/**
 * Increment scan usage count
 */
export async function incrementScanUsage(userId: string): Promise<void> {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  await db.scanUsage.upsert({
    where: {
      userId_month_year: {
        userId,
        month: currentMonth,
        year: currentYear,
      },
    },
    update: {
      count: { increment: 1 },
    },
    create: {
      userId,
      month: currentMonth,
      year: currentYear,
      count: 1,
    },
  });
}
