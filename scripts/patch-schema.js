#!/usr/bin/env node
// Patches prisma/schema.prisma for PostgreSQL production builds.
// Run during Vercel build: node scripts/patch-schema.js
// schema.prisma stays as SQLite (source of truth for dev).

const fs = require("fs");
const path = require("path");

const schemaPath = path.join(__dirname, "../prisma/schema.prisma");
let schema = fs.readFileSync(schemaPath, "utf8");

// Replace SQLite provider with PostgreSQL
schema = schema.replace(
  /provider\s*=\s*"sqlite"/,
  'provider = "postgresql"'
);

// Add binaryTargets after provider line if not already present
if (!schema.includes("binaryTargets")) {
  schema = schema.replace(
    /provider\s*=\s*"postgresql"/,
    'provider      = "postgresql"\n  binaryTargets = ["native", "rhel-openssl-3.0.x"]'
  );
}

fs.writeFileSync(schemaPath, schema, "utf8");
console.log("✅ Patched schema.prisma for PostgreSQL");
