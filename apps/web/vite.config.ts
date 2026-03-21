import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "")
      }
    }
  },
  resolve: {
    alias: {
      "@morphverse/domain": path.resolve(__dirname, "../../packages/domain/src/index.ts"),
      "@morphverse/application": path.resolve(__dirname, "../../packages/application/src/index.ts"),
      "@morphverse/ui": path.resolve(__dirname, "../../packages/ui/src/index.ts")
    }
  }
});
