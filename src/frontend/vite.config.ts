/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import environment from "vite-plugin-environment";
import dotenv from "dotenv";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "url";

dotenv.config({ path: "../../.env" });

export default defineConfig({
  root: __dirname,
  build: {
    outDir: "dist/",
    emptyOutDir: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4943",
        changeOrigin: true,
      },
    },
    allowedHosts: [],
  },
  plugins: [
    react(),
    tailwindcss(),
    environment("all", { prefix: "CANISTER_" }),
    environment("all", { prefix: "DFX_" }),
    environment("all", { prefix: "VITE_" }),
  ],
  define: {
    // 直接定义环境变量
    "import.meta.env.CANISTER_ID_INTERNET_IDENTITY": JSON.stringify(
      process.env.CANISTER_ID_INTERNET_IDENTITY,
    ),
    "import.meta.env.CANISTER_ID_BACKEND": JSON.stringify(
      process.env.CANISTER_ID_BACKEND,
    ),
    "import.meta.env.DFX_NETWORK": JSON.stringify(process.env.DFX_NETWORK),
  },
  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(new URL("../declarations", import.meta.url)),
      },
    ],
    dedupe: ["@dfinity/agent"],
  },
  test: {
    environment: "jsdom",
    setupFiles: "frontend-test-setup.ts",
    globals: true,
  },
});
