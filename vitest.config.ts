import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
    include: ["**/__tests__/**/*.test.ts", "**/*.test.ts"],
    exclude: ["**/*.tsx", "node_modules", ".next"],
    globals: true,
    restoreMocks: true,
    clearMocks: true,
    mockReset: true,
  },
});
