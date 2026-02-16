import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        { src: "public/manifest.json", dest: "." },
        { src: "src/content/style.css", dest: "content", rename: "content.css" }
      ],
    }),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        ui: resolve(__dirname, "index.html"),
        content: resolve(__dirname, "src/content/content.js"),
        mount: resolve(__dirname, "src/injected/mount.js"),
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === "content") return "content/content.js";
          if (chunk.name === "mount") return "injected/mount.js";
          return "assets/[name]-[hash].js";
        },
      },
    },
  },
});