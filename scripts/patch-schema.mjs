#!/usr/bin/env node
// Patches prisma/schema.prisma for PostgreSQL production builds.
// Run during Vercel build: node scripts/patch-schema.mjs
// schema.prisma stays as SQLite (source of truth for dev).

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, "../prisma/schema.prisma");
let schema = readFileSync(schemaPath, "utf8");

// Replace SQLite provider with PostgreSQL in datasource block
schema = schema.replace(
  /provider\s*=\s*"sqlite"/,
  'provider = "postgresql"'
);

// Add binaryTargets to generator block if not already present
if (!schema.includes("binaryTargets")) {
  schema = schema.replace(
    /generator\s+client\s*\{[^}]*\}/,
    (match) => {
      // Insert binaryTargets before the closing brace
      return match.replace(/\}(\s*)$/, '  binaryTargets = ["native", "rhel-openssl-3.0.x"]\n}$1');
    }
  );
}

writeFileSync(schemaPath, schema, "utf8");
console.log("✅ Patched schema.prisma for PostgreSQL");
