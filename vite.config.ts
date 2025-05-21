import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Set base path dynamically based on environment
const isProduction = process.env.NODE_ENV === "production";
const basePath = isProduction ? "/demos.timeplus.com/" : "";

export default defineConfig({
  base: basePath,
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
