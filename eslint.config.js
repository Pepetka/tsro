import tseslint from "typescript-eslint";
import { globalIgnores } from "eslint/config";
import perfectionist from "eslint-plugin-perfectionist";
import unusedImports from "eslint-plugin-unused-imports";
import eslintConfigPrettier from "eslint-config-prettier";

import eslint from "@eslint/js";

export default tseslint.config(
  globalIgnores(["dist/*", "src/test/*"]),
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-empty-object-type": [
        "error",
        {
          allowInterfaces: "with-single-extends",
        },
      ],
      "@typescript-eslint/no-require-imports": "warn",
    },
  },
  {
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      "unused-imports/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
    },
  },
  {
    plugins: {
      perfectionist,
    },
    rules: {
      "perfectionist/sort-imports": [
        "error",
        {
          type: "line-length",
          order: "asc",
          fallbackSort: { type: "unsorted" },
          ignoreCase: true,
          internalPattern: ["^@.*"],
          groups: [
            ["builtin", "external"],
            ["internal-type", "internal"],
            ["parent-type", "sibling-type", "index-type", "parent", "sibling", "index"],
            "style",
            "unknown",
          ],
        },
      ],
    },
  },
  eslintConfigPrettier,
);
