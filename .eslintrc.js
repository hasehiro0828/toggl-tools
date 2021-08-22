module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["airbnb-base", "plugin:import/recommended", "plugin:import/typescript", "prettier"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/explicit-function-return-type": "warn",
    "import/order": [
      "error",
      {
        groups: ["builtin", "external", "parent", "sibling", "index", "object", "type"],
        // pathGroups: [
        //   {
        //     pattern: "@alias/**",
        //     group: "parent",
        //     position: "before",
        //   },
        // ],
        alphabetize: {
          order: "asc",
        },
        "newlines-between": "always",
      },
    ],
  },
  settings: {
    "import/resolver": {
      typescript: {
        // alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
        project: ".",
      },
    },
  },
};
