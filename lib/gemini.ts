// ============================================
// CardScan Pro — Gemini AI Client
// ============================================

import { GoogleGenerativeAI } from "@google/generative-ai";
import { CARD_EXTRACTION_PROMPT } from "@/constants";
import { cardDataSchema } from "@/lib/validations";
import type { ExtractedCardData } from "@/types";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error(
    "GEMINI_API_KEY is not set. Add it to your .env.local file."
  );
}

const genAI = new GoogleGenerativeAI(apiKey);

const GEMINI_TIMEOUT_MS = 30_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Gemini API timed out after ${ms}ms`)), ms)
    ),
  ]);
}

function isValidMimeType(mime: string): boolean {
  return ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mime);
}

const EMPTY_RESULT: ExtractedCardData = {
  name: null,
  designation: null,
  company: null,
  emails: [],
  phones: [],
  websites: [],
  address: null,
};

export async function extractCardFromImage(
  base64Image: string,
  mimeType: string = "image/jpeg"
): Promise<{ data: ExtractedCardData; parseFailed: boolean }> {
  const validMime = isValidMimeType(mimeType) ? mimeType : "image/jpeg";
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const imageData = base64Image.replace(/^data:image\/\w+;base64,/, "");

  const result = await withTimeout(
    model.generateContent([
      CARD_EXTRACTION_PROMPT,
      {
        inlineData: {
          mimeType: validMime,
          data: imageData,
        },
      },
    ]),
    GEMINI_TIMEOUT_MS
  );

  const text = result.response.text();

  const cleanJson = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  try {
    const parsed = JSON.parse(cleanJson);
    const validated = cardDataSchema.parse(parsed);
    return { data: validated, parseFailed: false };
  } catch {
    console.error("Failed to parse Gemini response:", text.slice(0, 200));
    return { data: EMPTY_RESULT, parseFailed: true };
  }
}
