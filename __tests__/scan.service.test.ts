import { describe, it, expect, vi, beforeEach } from "vitest";
import { reserveScanSlot, checkScanQuota } from "@/services/scan.service";

vi.mock("@/lib/db", () => ({
  db: {
    subscription: { findUnique: vi.fn() },
    scanUsage: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/gemini", () => ({
  extractCardFromImage: vi.fn(),
}));

import { db } from "@/lib/db";

describe("reserveScanSlot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows scan when no subscription (free plan, limit 5)", async () => {
    vi.mocked(db.subscription.findUnique).mockResolvedValue(null as never);
    vi.mocked(db.scanUsage.upsert).mockResolvedValue({
      id: "usage-1",
      userId: "user-1",
      count: 1,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });

    const result = await reserveScanSlot("user-1");

    expect(result.allowed).toBe(true);
    expect(result.used).toBe(1);
    expect(result.limit).toBe(5);
    expect(result.planName).toBe("FREE");
  });

  it("denies scan when at quota limit", async () => {
    vi.mocked(db.subscription.findUnique).mockResolvedValue(null as never);
    vi.mocked(db.scanUsage.upsert).mockResolvedValue({
      id: "usage-1",
      userId: "user-1",
      count: 6,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });
    vi.mocked(db.scanUsage.update).mockResolvedValue({
      id: "usage-1",
      userId: "user-1",
      count: 5,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });

    const result = await reserveScanSlot("user-1");

    expect(result.allowed).toBe(false);
    expect(result.used).toBe(5);
    expect(result.limit).toBe(5);
    expect(db.scanUsage.update).toHaveBeenCalled();
  });

  it("allows unlimited scans for enterprise plan", async () => {
    vi.mocked(db.subscription.findUnique).mockResolvedValue({
      id: "sub-1",
      userId: "user-1",
      planId: "plan-1",
      plan: { name: "ENTERPRISE", scanLimit: -1 },
    } as never);

    const result = await reserveScanSlot("user-1");

    expect(result.allowed).toBe(true);
    expect(result.limit).toBe(-1);
    expect(result.planName).toBe("ENTERPRISE");
    expect(db.scanUsage.upsert).not.toHaveBeenCalled();
  });

  it("rolls back when count exceeds limit", async () => {
    vi.mocked(db.subscription.findUnique).mockResolvedValue(null as never);
    vi.mocked(db.scanUsage.upsert).mockResolvedValue({
      id: "usage-1",
      userId: "user-1",
      count: 6,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });
    vi.mocked(db.scanUsage.update).mockResolvedValue({
      id: "usage-1",
      userId: "user-1",
      count: 5,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });

    await reserveScanSlot("user-1");

    expect(db.scanUsage.update).toHaveBeenCalledWith({
      where: {
        userId_month_year: {
          userId: "user-1",
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        },
      },
      data: { count: { decrement: 1 } },
    });
  });
});

describe("checkScanQuota", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns free plan defaults when no subscription", async () => {
    vi.mocked(db.subscription.findUnique).mockResolvedValue(null as never);
    vi.mocked(db.scanUsage.findUnique).mockResolvedValue(null);

    const result = await checkScanQuota("user-1");

    expect(result.planName).toBe("FREE");
    expect(result.limit).toBe(5);
    expect(result.used).toBe(0);
    expect(result.allowed).toBe(true);
  });

  it("returns correct usage count", async () => {
    vi.mocked(db.subscription.findUnique).mockResolvedValue(null as never);
    vi.mocked(db.scanUsage.findUnique).mockResolvedValue({
      id: "usage-1",
      userId: "user-1",
      count: 3,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });

    const result = await checkScanQuota("user-1");

    expect(result.used).toBe(3);
    expect(result.allowed).toBe(true);
  });

  it("reports not allowed when usage equals limit", async () => {
    vi.mocked(db.subscription.findUnique).mockResolvedValue(null as never);
    vi.mocked(db.scanUsage.findUnique).mockResolvedValue({
      id: "usage-1",
      userId: "user-1",
      count: 5,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });

    const result = await checkScanQuota("user-1");

    expect(result.used).toBe(5);
    expect(result.allowed).toBe(false);
  });

  it("returns unlimited for enterprise plan", async () => {
    vi.mocked(db.subscription.findUnique).mockResolvedValue({
      id: "sub-1",
      userId: "user-1",
      planId: "plan-1",
      plan: { name: "ENTERPRISE", scanLimit: -1 },
    } as never);

    const result = await checkScanQuota("user-1");

    expect(result.allowed).toBe(true);
    expect(result.limit).toBe(-1);
    expect(result.planName).toBe("ENTERPRISE");
  });
});
