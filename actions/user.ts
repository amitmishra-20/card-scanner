// ============================================
// CardScan Pro — User / Auth Server Actions
// ============================================

"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signUpSchema, updateProfileSchema } from "@/lib/validations";
import {
  getOrCreateSubscription,
  getCurrentUsage,
} from "@/services/subscription.service";
import type { ActionResult, UserProfile } from "@/types";

/**
 * Register a new user with email/password
 */
export async function registerUser(formData: {
  name: string;
  email: string;
  password: string;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = signUpSchema.safeParse(formData);
    if (!validated.success) {
      return { success: false, error: "Invalid registration data" };
    }

    const { name, email, password } = validated.data;

    const hashedPassword = await bcrypt.hash(password, 12);

    // Use create and catch unique constraint error instead of findUnique + create
    // to prevent race conditions
    const user = await db.user
      .create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      })
      .catch((error) => {
        if (
          error instanceof Error &&
          error.message.includes("Unique constraint")
        ) {
          return null;
        }
        throw error;
      });

    if (!user) {
      // Return generic error to prevent user enumeration
      return { success: false, error: "Registration failed" };
    }

    // Auto-assign free plan
    await getOrCreateSubscription(user.id).catch((error) => {
      console.error(
        "Failed to create subscription:",
        error instanceof Error ? error.message : error
      );
    });

    return { success: true, data: { id: user.id } };
  } catch (error) {
    console.error(
      "Register error:",
      error instanceof Error ? error.message : error
    );
    return { success: false, error: "Registration failed" };
  }
}

/**
 * Get current user profile
 */
export async function getUserProfileAction(): Promise<
  ActionResult<UserProfile>
> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const [subscription, scansUsed] = await Promise.all([
      getOrCreateSubscription(session.user.id),
      getCurrentUsage(session.user.id),
    ]);

    return {
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        plan: subscription.plan.name as "FREE" | "PRO" | "ENTERPRISE",
        scansUsed,
        scanLimit: subscription.plan.scanLimit,
      },
    };
  } catch (error) {
    console.error(
      "Get profile error:",
      error instanceof Error ? error.message : error
    );
    return { success: false, error: "Failed to fetch profile" };
  }
}

/**
 * Update user profile (name)
 */
export async function updateProfileAction(
  formData: unknown
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const validated = updateProfileSchema.safeParse(formData);
    if (!validated.success) {
      return { success: false, error: "Invalid profile data" };
    }

    await db.user.update({
      where: { id: session.user.id },
      data: { name: validated.data.name },
    });

    return { success: true };
  } catch (error) {
    console.error(
      "Update profile error:",
      error instanceof Error ? error.message : error
    );
    return { success: false, error: "Failed to update profile" };
  }
}

/**
 * Delete user account and all associated data
 */
export async function deleteAccountAction(): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    await db.user.delete({
      where: { id: session.user.id },
    });

    return { success: true };
  } catch (error) {
    console.error(
      "Delete account error:",
      error instanceof Error ? error.message : error
    );
    return { success: false, error: "Failed to delete account" };
  }
}

/**
 * Check if Google OAuth is configured
 */
export async function getAuthConfigAction(): Promise<
  ActionResult<{ googleEnabled: boolean }>
> {
  const googleEnabled = !!(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );
  return { success: true, data: { googleEnabled } };
}
