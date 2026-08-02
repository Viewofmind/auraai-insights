import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", ".output", ".vinxi"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "server-only",
              message:
                "TanStack Start does not use the Next.js `server-only` package. Rename the module to `*.server.ts` or mark it with `@tanstack/react-start/server-only`.",
            },
          ],
        },
      ],
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    // Import boundary: the platform-owner console must never reach into the
    // tenant product's data layer or tenant-specific feature components.
    files: ["src/routes/_platform.*.{ts,tsx}", "src/routes/_platform/**/*.{ts,tsx}", "src/lib/platform/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/lib/api",
                "@/lib/api/*",
                "**/lib/api",
                "**/lib/api/*",
                "@/components/content/*",
                "@/components/compliance/*",
                "@/components/email/*",
                "@/components/geo/*",
                "**/components/content/*",
                "**/components/compliance/*",
                "**/components/email/*",
                "**/components/geo/*",
              ],
              message:
                "Platform console code must not import the tenant product API client or tenant feature components. Use the platform console's own isolated data layer.",
            },
          ],
        },
      ],
    },
  },
  eslintPluginPrettier,
);

