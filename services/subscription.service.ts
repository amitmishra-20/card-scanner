// ============================================
// CardScan Pro — Subscription Service
// ============================================

import { db } from "@/lib/db";

/**
 * Get or create a user's subscription (defaults to free plan).
 * Uses upsert pattern to prevent race conditions under concurrent requests.
 */
export async function getOrCreateSubscription(userId: string) {
  const existing = await db.subscription.findUnique({
    where: { userId },
    include: { plan: true },
  });

  if (existing) return existing;

  // Find or create the free plan
  let freePlan = await db.plan.findUnique({ where: { name: "FREE" } });
  if (!freePlan) {
    freePlan = await db.plan.create({
      data: {
        name: "FREE",
        displayName: "Free",
        price: 0,
        scanLimit: 5,
        interval: "month",
        features: JSON.stringify([
          "5 card scans per month",
          "Lead management",
          "Basic dashboard",
          "Email support",
        ]),
      },
    });
  }

  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  try {
    const subscription = await db.subscription.create({
      data: {
        userId,
        planId: freePlan.id,
        status: "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd: endOfMonth,
      },
      include: { plan: true },
    });
    return subscription;
  } catch (error) {
    // If unique constraint violated (race condition), retry the read
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      const subscription = await db.subscription.findUnique({
        where: { userId },
        include: { plan: true },
      });
      if (subscription) return subscription;
    }
    throw error;
  }
}

/**
 * Get current scan usage for a user
 */
export async function getCurrentUsage(userId: string) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const usage = await db.scanUsage.findUnique({
    where: { userId_month_year: { userId, month, year } },
  });

  return usage?.count ?? 0;
}
