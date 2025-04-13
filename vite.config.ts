import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import glsl from "vite-plugin-glsl";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
  },
  preview: {
    host: "::",
    port: Number(process.env.PORT) || 4173,
    allowedHosts: ["humming-bird-frontend-production.up.railway.app"],
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    glsl({
      exclude: undefined, // File paths/extensions to ignore
      include: "**/*.{glsl,wgsl,vert,frag,vs,fs}", // File paths/extensions to import
      defaultExtension: 'glsl', // Shader suffix when no extension is specified
      warnDuplicatedImports: true, // Warn if the same chunk was imported multiple times
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "shaders": "./src/lib/shaders",
    },
  },
}));


