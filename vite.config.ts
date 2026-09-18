import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
const oauthClientId = process.env.TREESPACE_GOOGLE_CLIENT_ID ?? "__TREESPACE_GOOGLE_CLIENT_ID__";

if (
  oauthClientId !== "__TREESPACE_GOOGLE_CLIENT_ID__" &&
  !/^[0-9]+-[a-z0-9-]+\.apps\.googleusercontent\.com$/i.test(oauthClientId)
) {
  throw new Error("TREESPACE_GOOGLE_CLIENT_ID must be a Google OAuth client ID ending in .apps.googleusercontent.com");
}

export default defineConfig({
  root: resolve(projectRoot, "src"),
  plugins: [
    react(),
    {
      name: "emit-manifest",
      generateBundle() {
        this.emitFile({
          type: "asset",
          fileName: "manifest.json",
          source: readFileSync(resolve(projectRoot, "manifest.json"), "utf8").replace(
            "__TREESPACE_GOOGLE_CLIENT_ID__",
            oauthClientId
          )
        });
      }
    }
  ],
  build: {
    outDir: resolve(projectRoot, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(projectRoot, "src/popup/index.html"),
        options: resolve(projectRoot, "src/options/index.html"),
        "background/service-worker": resolve(projectRoot, "src/background/service-worker.ts")
      },
      output: {
        entryFileNames: "[name].js"
      }
    }
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"]
  }
});
