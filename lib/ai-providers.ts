// ============================================
// CardScan Pro — Multi-Provider AI Client
// ============================================
// OpenRouter (primary) -> Groq (fallback)
// Auto-failover on billing/quota/timeout errors

import OpenAI from "openai";
import { CARD_EXTRACTION_PROMPT } from "@/constants";
import { cardDataSchema } from "@/lib/validations";
import type { ExtractedCardData } from "@/types";

const AI_TIMEOUT_MS = 30_000;

// --- Provider Definitions ---

interface AIProvider {
  name: string;
  client: OpenAI;
  model: string;
  available: boolean;
}

function buildProviders(): AIProvider[] {
  const providers: AIProvider[] = [];

  if (process.env.OPENROUTER_API_KEY) {
    providers.push({
      name: "openrouter",
      client: new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY,
        defaultHeaders: {
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "CardScan Pro",
        },
      }),
      // model:'openrouter/free',
      model: "meta-llama/llama-4-scout",
      available: true,
    });
  }

  if (process.env.GROQ_API_KEY) {
    providers.push({
      name: "groq",
      client: new OpenAI({
        baseURL: "https://api.groq.com/openai/v1",
        apiKey: process.env.GROQ_API_KEY,
      }),
      model: "llama-3.3-70b-versatile",
      available: true,
    });
  }

  return providers;
}

let providers = buildProviders();

// --- Error Classification ---

function isRetryableError(error: unknown): boolean {
  if (error instanceof OpenAI.APIError) {
    const status = error.status;
    if (status === 402 || status === 429 || status === 503 || status === 529) {
      return true;
    }
  }
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (
      msg.includes("timeout") ||
      msg.includes("econnreset") ||
      msg.includes("econnrefused") ||
      msg.includes("fetch failed") ||
      msg.includes("billing") ||
      msg.includes("quota") ||
      msg.includes("rate limit") ||
      msg.includes("insufficient")
    ) {
      return true;
    }
  }
  return false;
}

function disableProvider(name: string): void {
  providers = providers.map((p) =>
    p.name === name ? { ...p, available: false } : p
  );
}

function resetProviders(): void {
  providers = buildProviders();
}

// --- Core Extraction ---

function isValidMimeType(mime: string): boolean {
  return ["image/jpeg", "image/png", "image/webp"].includes(mime);
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

function normalizeWebsite(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function cleanJsonResponse(text: string): string {
  return text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`AI API timed out after ${ms}ms`)),
        ms
      )
    ),
  ]);
}

async function callProvider(
  provider: AIProvider,
  base64Image: string,
  mimeType: string
): Promise<{ data: ExtractedCardData; parseFailed: boolean }> {
  const response = await withTimeout(
    provider.client.chat.completions.create({
      model: provider.model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: CARD_EXTRACTION_PROMPT },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 4096,
    }),
    AI_TIMEOUT_MS
  );

  const text = response.choices?.[0]?.message?.content ?? "";
  const finishReason = response.choices?.[0]?.finish_reason;

  if (!text) {
    return { data: EMPTY_RESULT, parseFailed: true };
  }

  if (finishReason === "length") {
    console.warn(`${provider.name} response truncated (finish_reason=length)`);
  }

  const cleanJson = cleanJsonResponse(text);

  try {
    const parsed = JSON.parse(cleanJson) as Record<string, unknown>;
    if (Array.isArray(parsed.websites)) {
      parsed.websites = parsed.websites.map((w: unknown) =>
        typeof w === "string" ? normalizeWebsite(w) : w
      );
    }
    const validated = cardDataSchema.parse(parsed);
    return { data: validated, parseFailed: false };
  } catch {
    console.error(
      `Failed to parse ${provider.name} response:`,
      text.slice(0, 200)
    );
    return { data: EMPTY_RESULT, parseFailed: true };
  }
}

// --- Public API ---

export async function extractCardFromImage(
  base64Image: string,
  mimeType: string = "image/jpeg",
  _retryCount = 0
): Promise<{ data: ExtractedCardData; parseFailed: boolean }> {
  const validMime = isValidMimeType(mimeType) ? mimeType : "image/jpeg";
  const imageData = base64Image.replace(/^data:image\/\w+;base64,/, "");

  const availableProviders = providers.filter((p) => p.available);

  if (availableProviders.length === 0) {
    if (_retryCount >= 2) {
      throw new Error("All AI providers failed after retry");
    }
    console.error("No AI providers available, resetting provider pool");
    resetProviders();
    return extractCardFromImage(base64Image, validMime, _retryCount + 1);
  }

  let lastError: unknown;

  for (const provider of availableProviders) {
    try {
      const result = await callProvider(provider, imageData, validMime);
      return result;
    } catch (error) {
      lastError = error;
      console.error(
        `${provider.name} failed:`,
        error instanceof Error ? error.message : error
      );

      if (isRetryableError(error)) {
        disableProvider(provider.name);
        console.log(`Disabled ${provider.name}, trying next provider...`);
        continue;
      }

      throw error;
    }
  }

  resetProviders();
  throw new Error(
    `All AI providers failed. Last error: ${lastError instanceof Error ? lastError.message : String(lastError)}`
  );
}
