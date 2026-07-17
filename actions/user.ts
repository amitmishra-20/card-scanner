// ============================================
// CardScan Pro — User / Auth Server Actions
// ============================================

"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signUpSchema, updateProfileSchema } from "@/lib/validations";
import { getOrCreateSubscription, getCurrentUsage } from "@/services/subscription.service";
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

    // Check if user exists
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false, error: "Email already registered" };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Auto-assign free plan
    await getOrCreateSubscription(user.id);

    return { success: true, data: { id: user.id } };
  } catch (error) {
    console.error("Register error:", error);
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

    const subscription = await getOrCreateSubscription(session.user.id);
    const scansUsed = await getCurrentUsage(session.user.id);

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
    console.error("Get profile error:", error);
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
    console.error("Update profile error:", error);
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
    console.error("Delete account error:", error);
    return { success: false, error: "Failed to delete account" };
  }
}

/**
 * Check if Google OAuth is configured
 */
export async function getAuthConfigAction(): Promise<ActionResult<{ googleEnabled: boolean }>> {
  const googleEnabled = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  return { success: true, data: { googleEnabled } };
}
