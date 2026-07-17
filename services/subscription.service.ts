// ============================================
// CardScan Pro — Subscription Service
// ============================================

import { db } from "@/lib/db";

/**
 * Get or create a user's subscription (defaults to free plan)
 */
export async function getOrCreateSubscription(userId: string) {
  let subscription = await db.subscription.findUnique({
    where: { userId },
    include: { plan: true },
  });

  if (!subscription) {
    // Find or create the free plan
    let freePlan = await db.plan.findUnique({
      where: { name: "FREE" },
    });

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

    subscription = await db.subscription.create({
      data: {
        userId,
        planId: freePlan.id,
        status: "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd: endOfMonth,
      },
      include: { plan: true },
    });
  }

  return subscription;
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

/**
 * Get user profile with subscription info
 */
export async function getUserProfile(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found");

  const subscription = await getOrCreateSubscription(userId);
  const scansUsed = await getCurrentUsage(userId);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    plan: subscription.plan.name,
    scansUsed,
    scanLimit: subscription.plan.scanLimit,
  };
}
