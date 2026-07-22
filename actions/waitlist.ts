// ============================================
// CardScan Pro — Waitlist Server Action
// ============================================

"use server";

import { db } from "@/lib/db";
import { z } from "zod/v4";
import type { ActionResult } from "@/types";

const waitlistSchema = z.string().email("Valid email is required");

export async function isOnWaitlist(
  email: string
): Promise<ActionResult<{ onWaitlist: boolean }>> {
  try {
    const validated = waitlistSchema.safeParse(email);
    if (!validated.success) {
      return { success: false, error: "Valid email is required" };
    }

    const existing = await db.waitlist.findUnique({
      where: { email: validated.data },
      select: { id: true },
    });

    return { success: true, data: { onWaitlist: !!existing } };
  } catch (error) {
    console.error(
      "Check waitlist error:",
      error instanceof Error ? error.message : error
    );
    return { success: false, error: "Failed to check waitlist status" };
  }
}

export async function joinWaitlist(
  email: string
): Promise<ActionResult<{ message: string }>> {
  try {
    const validated = waitlistSchema.safeParse(email);
    if (!validated.success) {
      return { success: false, error: "Valid email is required" };
    }

    const existing = await db.waitlist.findUnique({
      where: { email: validated.data },
    });

    if (existing) {
      return {
        success: true,
        data: { message: "You're already on the waitlist!" },
      };
    }

    await db.waitlist
      .create({
        data: { email: validated.data },
      })
      .catch((error: unknown) => {
        // Handle race condition: unique constraint violation
        if (
          error instanceof Error &&
          (error as { code?: string }).code === "P2002"
        ) {
          return null;
        }
        throw error;
      });

    return { success: true, data: { message: "Welcome to the waitlist!" } };
  } catch (error) {
    console.error(
      "Waitlist error:",
      error instanceof Error ? error.message : error
    );
    return { success: false, error: "Failed to join waitlist" };
  }
}
