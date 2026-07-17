// ============================================
// CardScan Pro — Gemini AI Client
// ============================================

import { GoogleGenerativeAI } from "@google/generative-ai";
import { CARD_EXTRACTION_PROMPT } from "@/constants";
import { cardDataSchema } from "@/lib/validations";
import type { ExtractedCardData } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Extract business card data from a base64 image using Gemini Vision.
 * Returns validated, structured contact information.
 */
export async function extractCardFromImage(
  base64Image: string,
  mimeType: string = "image/jpeg"
): Promise<ExtractedCardData> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  // Strip data URL prefix if present
  const imageData = base64Image.replace(/^data:image\/\w+;base64,/, "");

  const result = await model.generateContent([
    CARD_EXTRACTION_PROMPT,
    {
      inlineData: {
        mimeType,
        data: imageData,
      },
    },
  ]);

  const text = result.response.text();

  // Clean up response - remove any markdown code fences
  const cleanJson = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  try {
    const parsed = JSON.parse(cleanJson);
    // Validate with Zod, coercing any missing fields to defaults
    const validated = cardDataSchema.parse(parsed);
    return validated;
  } catch {
    // If parsing fails, return empty structure
    console.error("Failed to parse Gemini response:", text);
    return {
      name: null,
      designation: null,
      company: null,
      emails: [],
      phones: [],
      websites: [],
      address: null,
    };
  }
}
