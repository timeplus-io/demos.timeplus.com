import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Set base path dynamically based on environment
const isGithubPage = process.env.GH_PAGE === "true";
const basePath = isGithubPage ? "/demos.timeplus.com/" : "";

export default defineConfig({
  base: basePath,
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
