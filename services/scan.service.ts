// ============================================
// CardScan Pro — Scan Service
// ============================================

import { db } from "@/lib/db";
import { extractCardFromImage } from "@/lib/gemini";
import type { ExtractedCardData } from "@/types";

/**
 * Extract card data using Gemini AI.
 * Returns both data and whether parsing failed so callers can distinguish
 * an empty card from a failed extraction.
 */
export async function extractCard(
  base64Image: string,
  mimeType: string = "image/jpeg"
): Promise<{ data: ExtractedCardData; parseFailed: boolean }> {
  return extractCardFromImage(base64Image, mimeType);
}

/**
 * Atomically reserve a scan quota slot.
 * Uses an upsert + increment pattern to prevent TOCTOU race conditions.
 * Returns the updated count and whether the scan is allowed.
 */
export async function reserveScanSlot(userId: string): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  planName: string;
}> {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const subscription = await db.subscription.findUnique({
    where: { userId },
    include: { plan: true },
  });

  const scanLimit = subscription?.plan.scanLimit ?? 5;
  const planName = subscription?.plan.name ?? "FREE";

  if (scanLimit === -1) {
    return { allowed: true, used: 0, limit: -1, planName };
  }

  // Upsert the usage record first (creates if missing)
  const usage = await db.scanUsage.upsert({
    where: {
      userId_month_year: { userId, month: currentMonth, year: currentYear },
    },
    update: { count: { increment: 1 } },
    create: { userId, month: currentMonth, year: currentYear, count: 1 },
  });

  const newCount = usage.count;

  // If we just went over the limit, decrement back and deny
  if (newCount > scanLimit) {
    await db.scanUsage.update({
      where: {
        userId_month_year: { userId, month: currentMonth, year: currentYear },
      },
      data: { count: { decrement: 1 } },
    });
    return { allowed: false, used: newCount - 1, limit: scanLimit, planName };
  }

  return { allowed: true, used: newCount, limit: scanLimit, planName };
}

/**
 * Check current scan quota without mutating.
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

  const subscription = await db.subscription.findUnique({
    where: { userId },
    include: { plan: true },
  });

  const scanLimit = subscription?.plan.scanLimit ?? 5;
  const planName = subscription?.plan.name ?? "FREE";

  if (scanLimit === -1) {
    return { allowed: true, used: 0, limit: -1, planName };
  }

  const usage = await db.scanUsage.findUnique({
    where: {
      userId_month_year: { userId, month: currentMonth, year: currentYear },
    },
  });

  const used = usage?.count ?? 0;
  return { allowed: used < scanLimit, used, limit: scanLimit, planName };
}
