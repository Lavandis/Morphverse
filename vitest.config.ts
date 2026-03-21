import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    include: ["tests/**/*.spec.ts"]
  },
  resolve: {
    alias: {
      "@morphverse/domain": path.resolve(__dirname, "packages/domain/src/index.ts"),
      "@morphverse/application": path.resolve(__dirname, "packages/application/src/index.ts"),
      "@morphverse/ai": path.resolve(__dirname, "packages/ai/src/index.ts"),
      "@morphverse/data-access": path.resolve(__dirname, "packages/data-access/src/index.ts"),
      "@morphverse/ui": path.resolve(__dirname, "packages/ui/src/index.ts")
    }
  }
});
