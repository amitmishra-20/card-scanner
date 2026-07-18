import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";
import type { Prisma } from "@prisma/client";

/**
 * Higher-order wrapper for server actions that handles auth check.
 */
export async function withAuth<T>(
  fn: (userId: string) => Promise<T>
): Promise<ActionResult<T>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }
    const data = await fn(session.user.id);
    return { success: true, data };
  } catch (error) {
    console.error(
      "Action error:",
      error instanceof Error ? error.message : error
    );
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Revalidate leads and dashboard pages.
 */
export function revalidateLeadsPages() {
  revalidatePath("/leads");
  revalidatePath("/dashboard");
}

/**
 * Deserialize a lead's JSON string fields into arrays.
 */
export function deserializeLead<T extends { emails: string; phones: string; websites: string }>(
  lead: T
): Omit<T, "emails" | "phones" | "websites"> & {
  emails: string[];
  phones: string[];
  websites: string[];
} {
  return {
    ...lead,
    emails: parseJsonArray(lead.emails),
    phones: parseJsonArray(lead.phones),
    websites: parseJsonArray(lead.websites),
  };
}

function parseJsonArray(val: unknown): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Build a Prisma where clause with search and status filters.
 */
export function buildLeadWhere(userId: string, options?: { status?: string; search?: string }) {
  const where: Prisma.LeadWhereInput = { userId };

  if (options?.status) {
    where.status = options.status;
  }

  if (options?.search) {
    const search = options.search.slice(0, 200);
    where.OR = [
      { name: { contains: search } },
      { company: { contains: search } },
      { designation: { contains: search } },
      { emails: { contains: search } },
      { phones: { contains: search } },
    ];
  }

  return where;
}
