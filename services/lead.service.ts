// ============================================
// CardScan Pro — Lead Service
// ============================================

import { db } from "@/lib/db";
import type { LeadStatus } from "@/types";
import type { SaveLeadInput, UpdateLeadInput } from "@/lib/validations";
import { deserializeLead, buildLeadWhere } from "@/lib/helpers";

export async function createLead(userId: string, data: SaveLeadInput) {
  return db.lead.create({
    data: {
      userId,
      name: data.name,
      designation: data.designation,
      company: data.company,
      emails: JSON.stringify(data.emails),
      phones: JSON.stringify(data.phones),
      websites: JSON.stringify(data.websites),
      address: data.address,
      notes: data.notes,
      status: "NEW",
    },
  });
}

export async function getLeads(
  userId: string,
  options?: {
    status?: LeadStatus;
    search?: string;
    page?: number;
    limit?: number;
  }
) {
  const page = options?.page ?? 1;
  const limit = Math.min(options?.limit ?? 20, 100);
  const skip = (page - 1) * limit;
  const where = buildLeadWhere(userId, options);

  const [leads, total] = await Promise.all([
    db.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.lead.count({ where }),
  ]);

  return {
    leads: leads.map(deserializeLead),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getLeadById(userId: string, leadId: string) {
  const lead = await db.lead.findFirst({
    where: { id: leadId, userId },
  });
  if (!lead) return null;
  return deserializeLead(lead);
}

export async function updateLead(userId: string, data: UpdateLeadInput) {
  const result = await db.lead.updateMany({
    where: { id: data.id, userId },
    data: {
      name: data.name,
      designation: data.designation,
      company: data.company,
      emails: JSON.stringify(data.emails),
      phones: JSON.stringify(data.phones),
      websites: JSON.stringify(data.websites),
      address: data.address,
      notes: data.notes,
      status: data.status,
    },
  });

  if (result.count === 0) {
    throw new Error("Lead not found");
  }

  return { id: data.id };
}

export async function updateLeadStatus(
  userId: string,
  leadId: string,
  status: LeadStatus
) {
  const result = await db.lead.updateMany({
    where: { id: leadId, userId },
    data: { status },
  });

  if (result.count === 0) {
    throw new Error("Lead not found");
  }
}

export async function deleteLead(userId: string, leadId: string) {
  const result = await db.lead.deleteMany({
    where: { id: leadId, userId },
  });

  if (result.count === 0) {
    throw new Error("Lead not found");
  }
}

export async function getDashboardStats(userId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [
    totalLeads,
    newLeadsThisMonth,
    leadsByStatus,
    recentLeads,
    leadsOverTime,
    scansThisMonth,
    subscription,
  ] = await Promise.all([
    db.lead.count({ where: { userId } }),
    db.lead.count({
      where: { userId, createdAt: { gte: startOfMonth } },
    }),
    db.lead.groupBy({
      by: ["status"],
      where: { userId },
      _count: { status: true },
    }),
    db.lead.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.lead.findMany({
      where: { userId, createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    db.scanUsage.findUnique({
      where: { userId_month_year: { userId, month: currentMonth, year: currentYear } },
    }).then((u) => u?.count ?? 0),
    db.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    }),
  ]);

  const dailyCounts: Record<string, number> = {};
  leadsOverTime.forEach((lead) => {
    const date = lead.createdAt.toISOString().split("T")[0];
    dailyCounts[date] = (dailyCounts[date] || 0) + 1;
  });

  const convertedCount =
    leadsByStatus.find((s) => s.status === "CONVERTED")?._count?.status ?? 0;
  const conversionRate =
    totalLeads > 0 ? Math.round((convertedCount / totalLeads) * 100) : 0;

  return {
    totalLeads,
    newLeadsThisMonth,
    conversionRate,
    scansThisMonth,
    scanLimit: subscription?.plan.scanLimit ?? 5,
    leadsByStatus: leadsByStatus.map((s) => ({
      status: s.status as LeadStatus,
      count: s._count.status,
    })),
    leadsOverTime: Object.entries(dailyCounts).map(([date, count]) => ({
      date,
      count,
    })),
    recentLeads: recentLeads.map(deserializeLead),
  };
}
