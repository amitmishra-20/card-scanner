// ============================================
// CardScan Pro — Waitlist Server Action
// ============================================

"use server";

import { db } from "@/lib/db";
import type { ActionResult } from "@/types";

export async function joinWaitlist(
  email: string
): Promise<ActionResult<{ message: string }>> {
  try {
    if (!email || !email.includes("@")) {
      return { success: false, error: "Valid email is required" };
    }

    const existing = await db.waitlist.findUnique({
      where: { email },
    });

    if (existing) {
      return { success: true, data: { message: "You're already on the waitlist!" } };
    }

    await db.waitlist.create({
      data: { email },
    });

    return { success: true, data: { message: "Welcome to the waitlist!" } };
  } catch (error) {
    console.error("Waitlist error:", error);
    return { success: false, error: "Failed to join waitlist" };
  }
}
