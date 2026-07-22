// ============================================
// CardScan Pro — Admin Service
// ============================================

import { db } from "@/lib/db";
import type { UserWithStats, AdminDashboardStats, WaitlistEntry } from "@/types";

export async function getAllUsersWithStats(options?: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = options?.page ?? 1;
  const limit = Math.min(options?.limit ?? 20, 100);
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (options?.search) {
    const search = options.search.slice(0, 200);
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ];
  }

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        subscription: {
          select: { plan: { select: { name: true } } },
        },
        scanUsages: {
          select: { count: true },
        },
        leads: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            name: true,
            company: true,
            createdAt: true,
          },
        },
      },
    }),
    db.user.count({ where }),
  ]);

  const mapped: UserWithStats[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    image: u.image,
    role: u.role as "USER" | "ADMIN",
    plan: u.subscription?.plan?.name ?? "FREE",
    totalScans: u.scanUsages.reduce((sum, s) => sum + s.count, 0),
    lastScannedLead: u.leads[0] ?? null,
    createdAt: u.createdAt,
  }));

  return {
    users: mapped,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getWaitlistEntries(options?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{
  entries: WaitlistEntry[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const page = options?.page ?? 1;
  const limit = Math.min(options?.limit ?? 20, 100);
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (options?.search) {
    const search = options.search.slice(0, 200);
    where.email = { contains: search };
  }

  const [entries, total] = await Promise.all([
    db.waitlist.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.waitlist.count({ where }),
  ]);

  return {
    entries,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const [totalUsers, scanAgg, totalWaitlist] = await Promise.all([
    db.user.count(),
    db.scanUsage.aggregate({ _sum: { count: true } }),
    db.waitlist.count(),
  ]);

  return {
    totalUsers,
    totalScans: scanAgg._sum.count ?? 0,
    totalWaitlist,
  };
}
