// The lint setup erxes core and every plugin create-erxes makes share: a repo spreads `preset`
// into its vite.config.ts `lint`. The overrides' paths follow a plugin's layout (api/, ui/,
// migration/, scripts/); core has none of them and applies the rule sets to its own paths.
import type { OxlintConfig } from 'vite-plus/lint';
import { browserRules, designRules, rules, serverRules } from './rules.ts';

export { browserRules, designRules } from './rules.ts';

// Core owns these; a plugin reaches them through erxes-ui's public exports and the SDK.
const pluginImports = {
  patterns: [
    {
      group: [
        '@radix-ui/*',
        'radix-ui',
        '@apollo/*',
        'graphql',
        'mongoose',
        'erxes-ui/*',
        '!erxes-ui/*.css',
        '!erxes-ui/federation',
      ],
      message: 'Use erxes-ui through its public exports; data goes through oRPC (ui/src/orpc.ts).',
    },
    {
      group: ['@erxes/core-db', '@erxes/core-db/*'],
      message:
        "Core's tables are core's. Reach core through @erxes/plugin-sdk (api/src/core.ts); the plugin's own tables are in api/src/db.",
    },
  ],
};

export const preset = {
  plugins: ['typescript', 'unicorn', 'oxc', 'import', 'vitest', 'promise', 'node'],
  jsPlugins: [
    { name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' },
    { name: 'anti-slop', specifier: '@erxes/lint/anti-slop' },
    { name: 'erxes', specifier: '@erxes/lint/erxes' },
    { name: 'shadcn', specifier: '@erxes/lint/shadcn' },
  ],
  categories: { correctness: 'error', suspicious: 'error' },
  options: { typeAware: true, typeCheck: true },
  settings: {
    shadcn: {
      ui: ['erxes-ui', '@erxes/ui'],
      note: "Design rules: erxes-ui's AGENTS.md (packages/ui/AGENTS.md in erxes core).",
    },
  },
  rules,
  overrides: [
    {
      files: ['api/**', 'ui/**', 'migration/**', 'scripts/**'],
      rules: { 'no-restricted-imports': ['error', pluginImports] },
    },
    {
      files: ['api/**'],
      env: { node: true },
      rules: serverRules,
    },
    {
      files: ['ui/**'],
      plugins: ['react', 'jsx-a11y'],
      env: { browser: true },
      rules: {
        ...browserRules,
        ...designRules,
        'no-restricted-globals': [
          'error',
          { name: 'fetch', message: 'Call the API through ui/src/orpc.ts.' },
        ],
      },
    },
    {
      // Where settings come from the environment: the API's config, tests and build configs.
      files: [
        'api/src/config.ts',
        'api/src/test/**',
        'vite.config.ts',
        'api/drizzle.config.ts',
        'ui/rsbuild.config.ts',
      ],
      rules: { 'node/no-process-env': 'off' },
    },
    {
      // The migration kit's command-line tools: one-off, outside the size limits, printing to
      // the terminal and reading their settings.
      files: ['migration/**', 'scripts/**'],
      env: { node: true },
      rules: {
        'no-console': 'off',
        'node/no-process-env': 'off',
        'max-lines': 'off',
        'max-lines-per-function': 'off',
      },
    },
    {
      // Tools load these through their default export.
      files: ['vite.config.ts', 'api/drizzle.config.ts', 'ui/rsbuild.config.ts'],
      rules: { 'import/no-default-export': 'off' },
    },
    {
      // Last, so it wins over the server rules above. A test takes its steps in order (a race,
      // a session's lifetime); N+1s are a server concern. Fixtures write outside any
      // organisation's scope. A describe callback holds all its cases; max-lines still bounds
      // the file.
      files: ['**/__tests__/**', '**/*.test.ts', '**/*.test.tsx'],
      rules: {
        'max-lines-per-function': 'off',
        'no-await-in-loop': 'off',
        'erxes/no-org-filter': 'off',
      },
    },
  ],
} satisfies OxlintConfig;
