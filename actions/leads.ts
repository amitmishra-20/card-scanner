// ============================================
// CardScan Pro — Lead Server Actions
// ============================================

"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import * as leadService from "@/services/lead.service";
import {
  saveLeadSchema,
  updateLeadSchema,
  updateLeadStatusSchema,
} from "@/lib/validations";
import type { ActionResult, LeadStatus } from "@/types";

/**
 * Create a new lead
 */
export async function createLead(
  formData: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const validated = saveLeadSchema.safeParse(formData);
    if (!validated.success) {
      return { success: false, error: "Invalid lead data" };
    }

    const lead = await leadService.createLead(session.user.id, validated.data);

    revalidatePath("/leads");
    revalidatePath("/dashboard");

    return { success: true, data: { id: lead.id } };
  } catch (error) {
    console.error("Create lead error:", error instanceof Error ? error.message : error);
    return { success: false, error: "Failed to create lead" };
  }
}

/**
 * Get all leads with optional filters
 */
export async function getLeads(options?: {
  status?: LeadStatus;
  search?: string;
  page?: number;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const result = await leadService.getLeads(session.user.id, options);
    return { success: true, data: result };
  } catch (error) {
    console.error("Get leads error:", error instanceof Error ? error.message : error);
    return { success: false, error: "Failed to fetch leads" };
  }
}

/**
 * Get a single lead
 */
export async function getLead(leadId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const lead = await leadService.getLeadById(session.user.id, leadId);
    if (!lead) {
      return { success: false, error: "Lead not found" };
    }

    return { success: true, data: lead };
  } catch (error) {
    console.error("Get lead error:", error instanceof Error ? error.message : error);
    return { success: false, error: "Failed to fetch lead" };
  }
}

/**
 * Update a lead
 */
export async function updateLead(formData: unknown): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const validated = updateLeadSchema.safeParse(formData);
    if (!validated.success) {
      return { success: false, error: "Invalid lead data" };
    }

    await leadService.updateLead(session.user.id, validated.data);

    revalidatePath("/leads");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Update lead error:", error instanceof Error ? error.message : error);
    return { success: false, error: "Failed to update lead" };
  }
}

/**
 * Update lead status
 */
export async function updateLeadStatusAction(
  leadId: string,
  status: LeadStatus
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const validated = updateLeadStatusSchema.safeParse({ id: leadId, status });
    if (!validated.success) {
      return { success: false, error: "Invalid status" };
    }

    await leadService.updateLeadStatus(
      session.user.id,
      validated.data.id,
      validated.data.status
    );

    revalidatePath("/leads");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Update lead status error:", error instanceof Error ? error.message : error);
    return { success: false, error: "Failed to update status" };
  }
}

/**
 * Delete a lead
 */
export async function deleteLeadAction(
  leadId: string
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    await leadService.deleteLead(session.user.id, leadId);

    revalidatePath("/leads");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Delete lead error:", error instanceof Error ? error.message : error);
    return { success: false, error: "Failed to delete lead" };
  }
}

/**
 * Get dashboard stats
 */
export async function getDashboardData() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const stats = await leadService.getDashboardStats(session.user.id);
    return { success: true, data: stats };
  } catch (error) {
    console.error("Get dashboard error:", error instanceof Error ? error.message : error);
    return { success: false, error: "Failed to fetch dashboard data" };
  }
}
