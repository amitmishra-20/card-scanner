// ============================================
// CardScan Pro — Admin Server Actions
// ============================================

"use server";

import { requireAdmin } from "@/lib/role";
import * as adminService from "@/services/admin.service";
import type { ActionResult } from "@/types";

export async function getAdminDashboardData(): Promise<
  ActionResult<{
    totalUsers: number;
    totalScans: number;
    totalWaitlist: number;
  }>
> {
  try {
    const authResult = await requireAdmin();
    if (!authResult.success) return { success: false, error: authResult.error };

    const stats = await adminService.getAdminDashboardStats();
    return { success: true, data: stats };
  } catch (error) {
    console.error("Admin dashboard error:", error instanceof Error ? error.message : error);
    return { success: false, error: "Failed to fetch admin dashboard" };
  }
}

export async function getAdminUsersAction(options?: {
  search?: string;
  page?: number;
}): Promise<ActionResult<Awaited<ReturnType<typeof adminService.getAllUsersWithStats>>>> {
  try {
    const authResult = await requireAdmin();
    if (!authResult.success) return { success: false, error: authResult.error };

    const data = await adminService.getAllUsersWithStats(options);
    return { success: true, data };
  } catch (error) {
    console.error("Admin users error:", error instanceof Error ? error.message : error);
    return { success: false, error: "Failed to fetch users" };
  }
}

export async function getAdminWaitlistAction(options?: {
  search?: string;
  page?: number;
}): Promise<ActionResult<Awaited<ReturnType<typeof adminService.getWaitlistEntries>>>> {
  try {
    const authResult = await requireAdmin();
    if (!authResult.success) return { success: false, error: authResult.error };

    const data = await adminService.getWaitlistEntries(options);
    return { success: true, data };
  } catch (error) {
    console.error("Admin waitlist error:", error instanceof Error ? error.message : error);
    return { success: false, error: "Failed to fetch waitlist" };
  }
}
