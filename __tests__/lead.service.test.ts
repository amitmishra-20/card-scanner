import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  updateLeadStatus,
  deleteLead,
  getDashboardStats,
} from "@/services/lead.service";

function parseJsonArray(val: unknown): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try { return JSON.parse(val); } catch { return []; }
  }
  return [];
}

vi.mock("@/lib/helpers", () => ({
  deserializeLead: (l: { emails: string; phones: string; websites: string; [k: string]: unknown }) => ({
    ...l,
    emails: parseJsonArray(l.emails),
    phones: parseJsonArray(l.phones),
    websites: parseJsonArray(l.websites),
  }),
  buildLeadWhere: (_userId: string, options?: { status?: string; search?: string }) => {
    const where: Record<string, unknown> = { userId: _userId };
    if (options?.status) where.status = options.status;
    if (options?.search) {
      const s = options.search.slice(0, 200);
      where.OR = [
        { name: { contains: s } },
        { company: { contains: s } },
        { designation: { contains: s } },
        { emails: { contains: s } },
        { phones: { contains: s } },
      ];
    }
    return where;
  },
}));

vi.mock("@/lib/db", () => ({
  db: {
    lead: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
      groupBy: vi.fn(),
    },
    scanUsage: { findUnique: vi.fn() },
    subscription: { findUnique: vi.fn() },
  },
}));

import { db } from "@/lib/db";

const mockLeadData = {
  name: "Test Lead",
  designation: "CEO",
  company: "TestCo",
  emails: ["test@testco.com"],
  phones: ["+1-555-0001"],
  websites: ["https://testco.com"],
  address: "123 Test St",
  notes: "Test notes",
};

describe("createLead", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a lead with NEW status", async () => {
    vi.mocked(db.lead.create).mockResolvedValue({
      id: "lead-1",
      userId: "user-1",
      ...mockLeadData,
      emails: JSON.stringify(mockLeadData.emails),
      phones: JSON.stringify(mockLeadData.phones),
      websites: JSON.stringify(mockLeadData.websites),
      status: "NEW",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await createLead("user-1", mockLeadData);

    expect(result.status).toBe("NEW");
    expect(result.userId).toBe("user-1");
    expect(db.lead.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "user-1",
        name: "Test Lead",
        status: "NEW",
      }),
    });
  });
});

describe("getLeads", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns leads with default pagination", async () => {
    vi.mocked(db.lead.findMany).mockResolvedValue([
      {
        id: "lead-1",
        userId: "user-1",
        name: "Lead 1",
        designation: null,
        company: "Co1",
        emails: JSON.stringify(["a@b.com"]),
        phones: JSON.stringify(["123"]),
        websites: JSON.stringify(["https://c.com"]),
        address: null,
        notes: null,
        status: "NEW",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    vi.mocked(db.lead.count).mockResolvedValue(1);

    const result = await getLeads("user-1");

    expect(result.leads).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("parses JSON strings back to arrays", async () => {
    vi.mocked(db.lead.findMany).mockResolvedValue([
      {
        id: "lead-1",
        userId: "user-1",
        name: "Lead 1",
        designation: null,
        company: "Co1",
        emails: JSON.stringify(["a@b.com", "c@d.com"]),
        phones: JSON.stringify(["123", "456"]),
        websites: JSON.stringify(["https://c.com"]),
        address: null,
        notes: null,
        status: "NEW",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    vi.mocked(db.lead.count).mockResolvedValue(1);

    const result = await getLeads("user-1");

    expect(result.leads[0].emails).toEqual(["a@b.com", "c@d.com"]);
    expect(result.leads[0].phones).toEqual(["123", "456"]);
  });

  it("caps limit at 100", async () => {
    vi.mocked(db.lead.findMany).mockResolvedValue([]);
    vi.mocked(db.lead.count).mockResolvedValue(0);

    await getLeads("user-1", { limit: 500 });

    expect(db.lead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100 })
    );
  });

  it("applies status filter", async () => {
    vi.mocked(db.lead.findMany).mockResolvedValue([]);
    vi.mocked(db.lead.count).mockResolvedValue(0);

    await getLeads("user-1", { status: "CONTACTED" });

    expect(db.lead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: "CONTACTED" }),
      })
    );
  });

  it("applies search filter", async () => {
    vi.mocked(db.lead.findMany).mockResolvedValue([]);
    vi.mocked(db.lead.count).mockResolvedValue(0);

    await getLeads("user-1", { search: "acme" });

    expect(db.lead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ name: { contains: "acme" } }),
          ]),
        }),
      })
    );
  });

  it("caps search query at 200 chars", async () => {
    vi.mocked(db.lead.findMany).mockResolvedValue([]);
    vi.mocked(db.lead.count).mockResolvedValue(0);

    const longSearch = "x".repeat(300);
    await getLeads("user-1", { search: longSearch });

    expect(db.lead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ name: { contains: "x".repeat(200) } }),
          ]),
        }),
      })
    );
  });
});

describe("getLeadById", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns parsed lead when found", async () => {
    vi.mocked(db.lead.findFirst).mockResolvedValue({
      id: "lead-1",
      userId: "user-1",
      name: "Lead 1",
      designation: null,
      company: "Co1",
      emails: JSON.stringify(["a@b.com"]),
      phones: JSON.stringify(["123"]),
      websites: JSON.stringify(["https://c.com"]),
      address: null,
      notes: null,
      status: "NEW",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await getLeadById("user-1", "lead-1");

    expect(result).not.toBeNull();
    expect(result!.emails).toEqual(["a@b.com"]);
    expect(result!.phones).toEqual(["123"]);
    expect(result!.websites).toEqual(["https://c.com"]);
  });

  it("returns null when not found", async () => {
    vi.mocked(db.lead.findFirst).mockResolvedValue(null);
    const result = await getLeadById("user-1", "nonexistent");
    expect(result).toBeNull();
  });
});

describe("updateLead", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates lead atomically with updateMany", async () => {
    vi.mocked(db.lead.updateMany).mockResolvedValue({ count: 1 });

    await updateLead("user-1", {
      id: "lead-1",
      ...mockLeadData,
      status: "CONTACTED",
    });

    expect(db.lead.updateMany).toHaveBeenCalledWith({
      where: { id: "lead-1", userId: "user-1" },
      data: expect.objectContaining({
        name: "Test Lead",
        status: "CONTACTED",
      }),
    });
  });

  it("throws when lead not found", async () => {
    vi.mocked(db.lead.updateMany).mockResolvedValue({ count: 0 });

    await expect(
      updateLead("user-1", {
        id: "lead-1",
        ...mockLeadData,
        status: "NEW",
      })
    ).rejects.toThrow("Lead not found");
  });
});

describe("updateLeadStatus", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates status atomically", async () => {
    vi.mocked(db.lead.updateMany).mockResolvedValue({ count: 1 });

    await updateLeadStatus("user-1", "lead-1", "QUALIFIED");

    expect(db.lead.updateMany).toHaveBeenCalledWith({
      where: { id: "lead-1", userId: "user-1" },
      data: { status: "QUALIFIED" },
    });
  });

  it("throws when lead not found", async () => {
    vi.mocked(db.lead.updateMany).mockResolvedValue({ count: 0 });

    await expect(
      updateLeadStatus("user-1", "lead-1", "QUALIFIED")
    ).rejects.toThrow("Lead not found");
  });
});

describe("deleteLead", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes lead atomically", async () => {
    vi.mocked(db.lead.deleteMany).mockResolvedValue({ count: 1 });

    await deleteLead("user-1", "lead-1");

    expect(db.lead.deleteMany).toHaveBeenCalledWith({
      where: { id: "lead-1", userId: "user-1" },
    });
  });

  it("throws when lead not found", async () => {
    vi.mocked(db.lead.deleteMany).mockResolvedValue({ count: 0 });

    await expect(deleteLead("user-1", "lead-1")).rejects.toThrow(
      "Lead not found"
    );
  });
});

describe("getDashboardStats", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns empty stats for new user", async () => {
    vi.mocked(db.lead.count).mockResolvedValue(0);
    vi.mocked(db.lead.groupBy).mockResolvedValue([]);
    vi.mocked(db.lead.findMany).mockResolvedValue([]);
    vi.mocked(db.scanUsage.findUnique).mockResolvedValue(null);
    vi.mocked(db.subscription.findUnique).mockResolvedValue(null);

    const result = await getDashboardStats("user-1");

    expect(result.totalLeads).toBe(0);
    expect(result.newLeadsThisMonth).toBe(0);
    expect(result.conversionRate).toBe(0);
    expect(result.leadsByStatus).toEqual([]);
    expect(result.leadsOverTime).toEqual([]);
    expect(result.recentLeads).toEqual([]);
  });

  it("calculates conversion rate correctly", async () => {
    vi.mocked(db.lead.count)
      .mockResolvedValueOnce(10) // totalLeads
      .mockResolvedValueOnce(2); // newLeadsThisMonth
    vi.mocked(db.lead.groupBy).mockResolvedValue([
      { status: "CONVERTED", _count: { status: 3 } },
    ] as never);
    vi.mocked(db.lead.findMany).mockResolvedValue([]);
    vi.mocked(db.scanUsage.findUnique).mockResolvedValue(null);
    vi.mocked(db.subscription.findUnique).mockResolvedValue(null);

    const result = await getDashboardStats("user-1");

    expect(result.conversionRate).toBe(30);
  });

  it("groups leads over time by date", async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    vi.mocked(db.lead.count).mockResolvedValue(3);
    vi.mocked(db.lead.groupBy).mockResolvedValue([]);
    vi.mocked(db.lead.findMany)
      .mockResolvedValueOnce([]) // recentLeads
      .mockResolvedValueOnce([
        { createdAt: yesterday },
        { createdAt: today },
        { createdAt: today },
      ] as never); // leadsOverTime
    vi.mocked(db.scanUsage.findUnique).mockResolvedValue(null);
    vi.mocked(db.subscription.findUnique).mockResolvedValue(null);

    const result = await getDashboardStats("user-1");

    expect(result.leadsOverTime.length).toBeGreaterThanOrEqual(1);
  });

  it("returns scan quota info from subscription", async () => {
    vi.mocked(db.lead.count).mockResolvedValue(0);
    vi.mocked(db.lead.groupBy).mockResolvedValue([]);
    vi.mocked(db.lead.findMany).mockResolvedValue([]);
    vi.mocked(db.scanUsage.findUnique).mockResolvedValue({
      id: "u1",
      userId: "user-1",
      count: 3,
      month: 1,
      year: 2026,
    });
    vi.mocked(db.subscription.findUnique).mockResolvedValue({
      id: "sub-1",
      userId: "user-1",
      planId: "plan-1",
      plan: { name: "PRO", scanLimit: 50 },
    } as never);

    const result = await getDashboardStats("user-1");

    expect(result.scansThisMonth).toBe(3);
    expect(result.scanLimit).toBe(50);
  });
});
