import { defineConfig } from "vite";
import { miaodaDevPlugin } from "miaoda-sc-plugin";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";

// Single React instance paths — prevents "Cannot read properties of null (reading 'useState')"
// when /data/shadcn packages resolve a different physical React copy than /workspace packages.
const REACT_PATH     = "/workspace/node_modules/.pnpm/react@18.3.1/node_modules/react";
const REACT_DOM_PATH = "/workspace/node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    miaodaDevPlugin(),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Force ALL packages (including those from /data/shadcn) to use the same React instance
      "react":     REACT_PATH,
      "react-dom": REACT_DOM_PATH,
    },
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
});
