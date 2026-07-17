// ============================================
// CardScan Pro — Lead Service
// ============================================

import { db } from "@/lib/db";
import type { LeadStatus } from "@/types";
import type { SaveLeadInput, UpdateLeadInput } from "@/lib/validations";
import { getOrCreateSubscription, getCurrentUsage } from "./subscription.service";

function parseJsonArray(val: unknown): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try { return JSON.parse(val); } catch { return []; }
  }
  return [];
}

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
  const limit = options?.limit ?? 20;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { userId };

  if (options?.status) {
    where.status = options.status;
  }

  if (options?.search) {
    where.OR = [
      { name: { contains: options.search } },
      { company: { contains: options.search } },
      { designation: { contains: options.search } },
      { emails: { contains: options.search } },
      { phones: { contains: options.search } },
    ];
  }

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
    leads: leads.map((l) => ({
      ...l,
      emails: parseJsonArray(l.emails),
      phones: parseJsonArray(l.phones),
      websites: parseJsonArray(l.websites),
    })),
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
  return {
    ...lead,
    emails: parseJsonArray(lead.emails),
    phones: parseJsonArray(lead.phones),
    websites: parseJsonArray(lead.websites),
  };
}

export async function updateLead(userId: string, data: UpdateLeadInput) {
  const lead = await db.lead.findFirst({
    where: { id: data.id, userId },
  });

  if (!lead) {
    throw new Error("Lead not found");
  }

  return db.lead.update({
    where: { id: data.id },
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
}

export async function updateLeadStatus(
  userId: string,
  leadId: string,
  status: LeadStatus
) {
  const lead = await db.lead.findFirst({
    where: { id: leadId, userId },
  });

  if (!lead) {
    throw new Error("Lead not found");
  }

  return db.lead.update({
    where: { id: leadId },
    data: { status },
  });
}

export async function deleteLead(userId: string, leadId: string) {
  const lead = await db.lead.findFirst({
    where: { id: leadId, userId },
  });

  if (!lead) {
    throw new Error("Lead not found");
  }

  return db.lead.delete({
    where: { id: leadId },
  });
}

export async function getDashboardStats(userId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalLeads,
    newLeadsThisMonth,
    leadsByStatus,
    recentLeads,
    leadsOverTime,
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
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
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
    scansThisMonth: await getCurrentUsage(userId),
    scanLimit: (await getOrCreateSubscription(userId)).plan.scanLimit,
    leadsByStatus: leadsByStatus.map((s) => ({
      status: s.status as LeadStatus,
      count: s._count.status,
    })),
    leadsOverTime: Object.entries(dailyCounts).map(([date, count]) => ({
      date,
      count,
    })),
    recentLeads: recentLeads.map((l) => ({
      ...l,
      emails: parseJsonArray(l.emails),
      phones: parseJsonArray(l.phones),
      websites: parseJsonArray(l.websites),
    })),
  };
}
