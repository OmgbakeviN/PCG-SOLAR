import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  functions: {
    api: {
      name: "PCG Solar API",
      source: "./functions/api.ts",
    },
  },
});