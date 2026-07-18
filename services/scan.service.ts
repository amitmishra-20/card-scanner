// ============================================
// CardScan Pro — Scan Service
// ============================================

import { db } from "@/lib/db";
import { extractCardFromImage } from "@/lib/ai-providers";

export { extractCardFromImage };

async function getScanLimits(userId: string) {
  const subscription = await db.subscription.findUnique({
    where: { userId },
    include: { plan: true },
  });
  return {
    scanLimit: subscription?.plan.scanLimit ?? 5,
    planName: subscription?.plan.name ?? "FREE",
  };
}

/**
 * Atomically reserve a scan quota slot.
 * Uses an upsert + increment pattern to prevent TOCTOU race conditions.
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

  const { scanLimit, planName } = await getScanLimits(userId);

  if (scanLimit === -1) {
    return { allowed: true, used: 0, limit: -1, planName };
  }

  const usage = await db.scanUsage.upsert({
    where: {
      userId_month_year: { userId, month: currentMonth, year: currentYear },
    },
    update: { count: { increment: 1 } },
    create: { userId, month: currentMonth, year: currentYear, count: 1 },
  });

  const newCount = usage.count;

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

  const { scanLimit, planName } = await getScanLimits(userId);

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
