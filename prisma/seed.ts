import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Pre-create the FREE plan to avoid race conditions on first registration
  const existing = await prisma.plan.findUnique({ where: { name: "FREE" } });
  if (existing) {
    console.log("FREE plan already exists, skipping seed.");
    return;
  }

  await prisma.plan.create({
    data: {
      name: "FREE",
      displayName: "Free",
      price: 0,
      scanLimit: 5,
      interval: "month",
      features: JSON.stringify([
        "5 card scans per month",
        "Lead management",
        "Basic dashboard",
        "Email support",
      ]),
    },
  });

  console.log("Seeded FREE plan.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error("Seed failed:", e);
    prisma.$disconnect();
    process.exit(1);
  });
