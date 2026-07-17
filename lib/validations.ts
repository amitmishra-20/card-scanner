// ============================================
// CardScan Pro — Zod Validation Schemas
// ============================================

import { z } from "zod/v4";

const MAX_NAME_LENGTH = 200;
const MAX_TEXT_LENGTH = 2000;
const MAX_NOTES_LENGTH = 5000;

// --- Extracted Card Data (from Gemini response) ---
export const cardDataSchema = z.object({
  name: z.string().max(MAX_NAME_LENGTH).nullable(),
  designation: z.string().max(MAX_NAME_LENGTH).nullable(),
  company: z.string().max(MAX_NAME_LENGTH).nullable(),
  emails: z.array(z.string().email()).default([]),
  phones: z.array(z.string()).default([]),
  websites: z.array(z.string().url()).default([]),
  address: z.string().max(MAX_TEXT_LENGTH).nullable(),
});

export type CardDataInput = z.infer<typeof cardDataSchema>;

// --- Save Lead Form ---
export const saveLeadSchema = z.object({
  name: z.string().min(1, "Name is required").max(MAX_NAME_LENGTH).nullable(),
  designation: z.string().max(MAX_NAME_LENGTH).nullable(),
  company: z.string().max(MAX_NAME_LENGTH).nullable(),
  emails: z.array(z.string().max(254)),
  phones: z.array(z.string().max(50)),
  websites: z.array(z.string().max(2048)),
  address: z.string().max(MAX_TEXT_LENGTH).nullable(),
  notes: z.string().max(MAX_NOTES_LENGTH).nullable(),
});

export type SaveLeadInput = z.infer<typeof saveLeadSchema>;

// --- Update Lead ---
export const updateLeadSchema = saveLeadSchema.extend({
  id: z.string().min(1),
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "LOST", "CONVERTED"]),
});

export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;

// --- Update Lead Status ---
export const updateLeadStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "LOST", "CONVERTED"]),
});

// --- User Profile Update ---
export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(MAX_NAME_LENGTH),
});

// --- Sign In ---
export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
});

// --- Sign Up ---
export const signUpSchema = z.object({
  name: z.string().min(1, "Name is required").max(MAX_NAME_LENGTH),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
});
