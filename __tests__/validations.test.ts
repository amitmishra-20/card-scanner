import { describe, it, expect } from "vitest";
import {
  cardDataSchema,
  saveLeadSchema,
  updateLeadSchema,
  updateLeadStatusSchema,
  signInSchema,
  signUpSchema,
  updateProfileSchema,
} from "@/lib/validations";

describe("cardDataSchema", () => {
  it("accepts valid extracted card data", () => {
    const result = cardDataSchema.safeParse({
      name: "John Doe",
      designation: "CEO",
      company: "Acme Inc",
      emails: ["john@acme.com"],
      phones: ["+1-555-0100"],
      websites: ["https://acme.com"],
      address: "123 Main St",
    });
    expect(result.success).toBe(true);
  });

  it("accepts null values for optional fields", () => {
    const result = cardDataSchema.safeParse({
      name: null,
      designation: null,
      company: null,
      emails: [],
      phones: [],
      websites: [],
      address: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email in emails array", () => {
    const result = cardDataSchema.safeParse({
      name: "John",
      designation: null,
      company: null,
      emails: ["not-an-email"],
      phones: [],
      websites: [],
      address: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid URL in websites array", () => {
    const result = cardDataSchema.safeParse({
      name: "John",
      designation: null,
      company: null,
      emails: [],
      phones: [],
      websites: ["not-a-url"],
      address: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects name exceeding max length", () => {
    const result = cardDataSchema.safeParse({
      name: "x".repeat(201),
      designation: null,
      company: null,
      emails: [],
      phones: [],
      websites: [],
      address: null,
    });
    expect(result.success).toBe(false);
  });

  it("defaults empty arrays when not provided", () => {
    const result = cardDataSchema.safeParse({
      name: "John",
      designation: null,
      company: null,
      address: null,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.emails).toEqual([]);
      expect(result.data.phones).toEqual([]);
      expect(result.data.websites).toEqual([]);
    }
  });
});

describe("saveLeadSchema", () => {
  it("accepts valid lead data", () => {
    const result = saveLeadSchema.safeParse({
      name: "Jane Smith",
      designation: "VP Sales",
      company: "TechCorp",
      emails: ["jane@techcorp.com"],
      phones: ["+1-555-0200"],
      websites: ["https://techcorp.com"],
      address: "456 Oak Ave",
      notes: "Met at conference",
    });
    expect(result.success).toBe(true);
  });

  it("requires name", () => {
    const result = saveLeadSchema.safeParse({
      name: "",
      designation: null,
      company: null,
      emails: [],
      phones: [],
      websites: [],
      address: null,
      notes: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects name exceeding 200 chars", () => {
    const result = saveLeadSchema.safeParse({
      name: "x".repeat(201),
      designation: null,
      company: null,
      emails: [],
      phones: [],
      websites: [],
      address: null,
      notes: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects notes exceeding 5000 chars", () => {
    const result = saveLeadSchema.safeParse({
      name: "Jane",
      designation: null,
      company: null,
      emails: [],
      phones: [],
      websites: [],
      address: null,
      notes: "x".repeat(5001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects email exceeding 254 chars", () => {
    const result = saveLeadSchema.safeParse({
      name: "Jane",
      designation: null,
      company: null,
      emails: ["x".repeat(255)],
      phones: [],
      websites: [],
      address: null,
      notes: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects phone exceeding 50 chars", () => {
    const result = saveLeadSchema.safeParse({
      name: "Jane",
      designation: null,
      company: null,
      emails: [],
      phones: ["x".repeat(51)],
      websites: [],
      address: null,
      notes: null,
    });
    expect(result.success).toBe(false);
  });
});

describe("updateLeadSchema", () => {
  it("accepts valid update data with id and status", () => {
    const result = updateLeadSchema.safeParse({
      id: "lead-123",
      name: "Updated Name",
      designation: null,
      company: null,
      emails: [],
      phones: [],
      websites: [],
      address: null,
      notes: null,
      status: "CONTACTED",
    });
    expect(result.success).toBe(true);
  });

  it("requires id", () => {
    const result = updateLeadSchema.safeParse({
      name: "Test",
      designation: null,
      company: null,
      emails: [],
      phones: [],
      websites: [],
      address: null,
      notes: null,
      status: "NEW",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const result = updateLeadSchema.safeParse({
      id: "lead-123",
      name: "Test",
      designation: null,
      company: null,
      emails: [],
      phones: [],
      websites: [],
      address: null,
      notes: null,
      status: "INVALID_STATUS",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid lead statuses", () => {
    const statuses = ["NEW", "CONTACTED", "QUALIFIED", "LOST", "CONVERTED"];
    for (const status of statuses) {
      const result = updateLeadSchema.safeParse({
        id: "lead-123",
        name: "Test",
        designation: null,
        company: null,
        emails: [],
        phones: [],
        websites: [],
        address: null,
        notes: null,
        status,
      });
      expect(result.success).toBe(true);
    }
  });
});

describe("updateLeadStatusSchema", () => {
  it("accepts valid id and status", () => {
    const result = updateLeadStatusSchema.safeParse({
      id: "lead-123",
      status: "QUALIFIED",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty id", () => {
    const result = updateLeadStatusSchema.safeParse({
      id: "",
      status: "NEW",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const result = updateLeadStatusSchema.safeParse({
      id: "lead-123",
      status: "SUPER_CLOSED",
    });
    expect(result.success).toBe(false);
  });
});

describe("signInSchema", () => {
  it("accepts valid credentials", () => {
    const result = signInSchema.safeParse({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = signInSchema.safeParse({
      email: "not-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password shorter than 8 chars", () => {
    const result = signInSchema.safeParse({
      email: "test@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password longer than 128 chars", () => {
    const result = signInSchema.safeParse({
      email: "test@example.com",
      password: "x".repeat(129),
    });
    expect(result.success).toBe(false);
  });

  it("accepts password at exactly 8 chars", () => {
    const result = signInSchema.safeParse({
      email: "test@example.com",
      password: "12345678",
    });
    expect(result.success).toBe(true);
  });
});

describe("signUpSchema", () => {
  it("accepts valid registration data", () => {
    const result = signUpSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "securePass1",
    });
    expect(result.success).toBe(true);
  });

  it("requires name", () => {
    const result = signUpSchema.safeParse({
      name: "",
      email: "john@example.com",
      password: "securePass1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = signUpSchema.safeParse({
      name: "John",
      email: "bad-email",
      password: "securePass1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = signUpSchema.safeParse({
      name: "John",
      email: "john@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name exceeding 200 chars", () => {
    const result = signUpSchema.safeParse({
      name: "x".repeat(201),
      email: "john@example.com",
      password: "securePass1",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateProfileSchema", () => {
  it("accepts valid name", () => {
    const result = updateProfileSchema.safeParse({ name: "New Name" });
    expect(result.success).toBe(true);
  });

  it("requires name", () => {
    const result = updateProfileSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects name exceeding 200 chars", () => {
    const result = updateProfileSchema.safeParse({ name: "x".repeat(201) });
    expect(result.success).toBe(false);
  });
});
