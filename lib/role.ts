// ============================================
// CardScan Pro — Role Helper
// ============================================

import { auth } from "@/lib/auth";
import type { ActionResult } from "@/types";
import type { Session } from "next-auth";

export async function requireAdmin(): Promise<
  ActionResult & { session?: Session }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }
  if (session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }
  return { success: true, session };
}
