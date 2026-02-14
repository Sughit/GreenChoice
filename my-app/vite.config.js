import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        { src: "public/manifest.json", dest: "." },
        { src: "src/content/content.js", dest: "." },
        { src: "src/content/style.css", dest: ".", rename: "content.css" }
      ],
    }),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        ui: "index.html"
      }
    }
  },
  rollupOptions: {
    input: {
      content: "src/content/content.js"
    },
    output: {
      entryFileNames: "content.js"
    }
  }
});