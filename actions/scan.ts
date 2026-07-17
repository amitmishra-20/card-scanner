// ============================================
// CardScan Pro — Scan Server Actions
// ============================================

"use server";

import { auth } from "@/lib/auth";
import { extractCard, reserveScanSlot } from "@/services/scan.service";
import { z } from "zod/v4";
import type { ActionResult, ExtractedCardData } from "@/types";

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

const extractCardSchema = z.object({
  base64Image: z.string().min(1, "Image data is required"),
  mimeType: z.enum(ALLOWED_MIME_TYPES),
});

/**
 * Extract business card data from an image.
 * Uses atomic quota reservation to prevent race conditions.
 */
export async function extractCardData(
  base64Image: string,
  mimeType: string = "image/jpeg"
): Promise<ActionResult<{ cardData: ExtractedCardData; parseFailed: boolean }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const validated = extractCardSchema.safeParse({ base64Image, mimeType });
    if (!validated.success) {
      return { success: false, error: "Invalid input parameters" };
    }

    // Validate image size server-side
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const sizeBytes = Math.ceil((base64Data.length * 3) / 4);
    if (sizeBytes > MAX_IMAGE_SIZE_BYTES) {
      return {
        success: false,
        error: `Image too large (${(sizeBytes / 1024 / 1024).toFixed(1)}MB). Maximum is 10MB.`,
      };
    }

    // Atomic: reserve a slot first, then extract
    const quota = await reserveScanSlot(session.user.id);
    if (!quota.allowed) {
      return {
        success: false,
        error: `Scan limit reached (${quota.used}/${quota.limit}). Please upgrade your plan.`,
      };
    }

    const result = await extractCard(validated.data.base64Image, validated.data.mimeType);

    return { success: true, data: { cardData: result.data, parseFailed: result.parseFailed } };
  } catch (error) {
    console.error("Extract card error:", error instanceof Error ? error.message : error);
    return {
      success: false,
      error: "Failed to extract card data. Please try again.",
    };
  }
}

/**
 * Get current scan quota for the user.
 */
export async function getScanQuota(): Promise<
  ActionResult<{ used: number; limit: number; planName: string }>
> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const { checkScanQuota } = await import("@/services/scan.service");
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
    console.error("Get quota error:", error instanceof Error ? error.message : error);
    return { success: false, error: "Failed to get scan quota" };
  }
}
