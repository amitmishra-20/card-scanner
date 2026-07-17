import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/services/scan.service", () => ({
  extractCard: vi.fn(),
  reserveScanSlot: vi.fn(),
  checkScanQuota: vi.fn(),
}));

import { auth } from "@/lib/auth";
import { extractCard, reserveScanSlot, checkScanQuota } from "@/services/scan.service";

// We need to import the action after mocks are set up
const getExtractCardData = async () => {
  const mod = await import("@/actions/scan");
  return mod.extractCardData;
};

const getScanQuota = async () => {
  const mod = await import("@/actions/scan");
  return mod.getScanQuota;
};

describe("extractCardData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    const extractCardData = await getExtractCardData();
    const result = await extractCardData("base64image", "image/jpeg");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Not authenticated");
  });

  it("returns error for invalid MIME type", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    const extractCardData = await getExtractCardData();
    const result = await extractCardData("base64image", "image/bmp");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid input parameters");
  });

  it("returns error for oversized image", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    // Create base64 data that exceeds 10MB: ~13.3M chars of base64
    const largeBase64 = "A".repeat(14_000_000);
    const extractCardData = await getExtractCardData();
    const result = await extractCardData(largeBase64, "image/jpeg");
    expect(result.success).toBe(false);
    expect(result.error).toContain("too large");
  });

  it("returns error when quota exceeded", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(reserveScanSlot).mockResolvedValue({
      allowed: false,
      used: 5,
      limit: 5,
      planName: "FREE",
    });
    const extractCardData = await getExtractCardData();
    const result = await extractCardData("base64image", "image/jpeg");
    expect(result.success).toBe(false);
    expect(result.error).toContain("limit reached");
  });

  it("extracts card data successfully", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(reserveScanSlot).mockResolvedValue({
      allowed: true,
      used: 1,
      limit: 5,
      planName: "FREE",
    });
    vi.mocked(extractCard).mockResolvedValue({
      data: {
        name: "John Doe",
        designation: "CEO",
        company: "Acme",
        emails: ["john@acme.com"],
        phones: ["123"],
        websites: [],
        address: null,
      },
      parseFailed: false,
    });

    const extractCardData = await getExtractCardData();
    const result = await extractCardData("base64image", "image/jpeg");

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data!.cardData.name).toBe("John Doe");
    expect(result.data!.parseFailed).toBe(false);
  });

  it("returns parseFailed flag when AI parsing fails", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(reserveScanSlot).mockResolvedValue({
      allowed: true,
      used: 1,
      limit: 5,
      planName: "FREE",
    });
    vi.mocked(extractCard).mockResolvedValue({
      data: {
        name: null,
        designation: null,
        company: null,
        emails: [],
        phones: [],
        websites: [],
        address: null,
      },
      parseFailed: true,
    });

    const extractCardData = await getExtractCardData();
    const result = await extractCardData("base64image", "image/jpeg");

    expect(result.success).toBe(true);
    expect(result.data!.parseFailed).toBe(true);
  });

  it("catches internal errors gracefully", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(reserveScanSlot).mockRejectedValue(new Error("DB connection failed"));
    const extractCardData = await getExtractCardData();
    const result = await extractCardData("base64image", "image/jpeg");
    expect(result.success).toBe(false);
    expect(result.error).toContain("try again");
  });
});

describe("getScanQuota", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns error when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    const getScanQuotaAction = await getScanQuota();
    const result = await getScanQuotaAction();
    expect(result.success).toBe(false);
    expect(result.error).toBe("Not authenticated");
  });

  it("returns quota info for authenticated user", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(checkScanQuota).mockResolvedValue({
      allowed: true,
      used: 2,
      limit: 5,
      planName: "FREE",
    });

    const getScanQuotaAction = await getScanQuota();
    const result = await getScanQuotaAction();

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      used: 2,
      limit: 5,
      planName: "FREE",
    });
  });
});
