// ============================================
// CardScan Pro — Scan Server Actions
// ============================================

"use server";

import { auth } from "@/lib/auth";
import { extractCard, checkScanQuota, incrementScanUsage } from "@/services/scan.service";
import type { ActionResult, ExtractedCardData } from "@/types";

/**
 * Extract business card data from an image
 */
export async function extractCardData(
  base64Image: string,
  mimeType: string = "image/jpeg"
): Promise<ActionResult<ExtractedCardData>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Check quota
    const quota = await checkScanQuota(session.user.id);
    if (!quota.allowed) {
      return {
        success: false,
        error: `Scan limit reached (${quota.used}/${quota.limit}). Please upgrade your plan.`,
      };
    }

    // Extract card data via Gemini
    const data = await extractCard(base64Image, mimeType);

    // Increment usage
    await incrementScanUsage(session.user.id);

    return { success: true, data };
  } catch (error) {
    console.error("Extract card error:", error);
    return {
      success: false,
      error: "Failed to extract card data. Please try again.",
    };
  }
}

/**
 * Get current scan quota for the user
 */
export async function getScanQuota(): Promise<
  ActionResult<{ used: number; limit: number; planName: string }>
> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const quota = await checkScanQuota(session.user.id);
    return {
      success: true,
      data: {
        used: quota.used,
        limit: quota.limit,
        planName: quota.planName,
      },
    };
  } catch (error) {
    console.error("Get quota error:", error);
    return { success: false, error: "Failed to get scan quota" };
  }
}
