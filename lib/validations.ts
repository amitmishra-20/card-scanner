// ============================================
// CardScan Pro — Zod Validation Schemas
// ============================================

import { z } from "zod/v4";

// --- Extracted Card Data (from Gemini response) ---
export const cardDataSchema = z.object({
  name: z.string().nullable(),
  designation: z.string().nullable(),
  company: z.string().nullable(),
  emails: z.array(z.string().email()).default([]),
  phones: z.array(z.string()).default([]),
  websites: z.array(z.string().url()).default([]),
  address: z.string().nullable(),
});

export type CardDataInput = z.infer<typeof cardDataSchema>;

// --- Save Lead Form ---
export const saveLeadSchema = z.object({
  name: z.string().min(1, "Name is required").nullable(),
  designation: z.string().nullable(),
  company: z.string().nullable(),
  emails: z.array(z.string()),
  phones: z.array(z.string()),
  websites: z.array(z.string()),
  address: z.string().nullable(),
  notes: z.string().nullable(),
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
  name: z.string().min(1, "Name is required"),
});

// --- Sign In ---
export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// --- Sign Up ---
export const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
