import { configDefaults, defineConfig } from 'vite-plus';
import { budgetOverrides, budgetRules } from './tools/config/budgets.ts';
import { browserRules, lintBase, rules } from './tools/config/rules.ts';
import { noSkips } from './tools/test/no-skips.ts';

// The type check is tsrs (TypeScript 7) running as oxlint's tsgolint.
const tsrs = 'OXLINT_TSGOLINT_PATH=node_modules/.bin/tsrs-lint';

// Vite Task tracks the files each command reads; the lockfile is listed too, so an
// install that changes a dependency always reruns the task.
const tracked = { input: [{ auto: true }, 'pnpm-lock.yaml'] };

// Core owns these; the plugin reaches them through erxes-ui's public exports.
const restrictedImports = {
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

export default defineConfig({
  run: {
    tasks: {
      // A rerun with no edits replays the last result.
      check: { command: `${tsrs} vp check`, cache: tracked },
      fix: { command: `${tsrs} vp check --fix`, cache: false },
      test: { command: 'vp test run', cache: { ...tracked, env: ['DATA_TEST_URL'] } },
    },
  },
  fmt: {
    singleQuote: true,
    sortPackageJson: true,
    ignorePatterns: [
      '**/node_modules/**',
      '**/dist/**',
      'coverage/**',
      'api/drizzle/**',
      'pnpm-lock.yaml',
    ],
  },
  lint: {
    ...lintBase,
    ignorePatterns: ['**/node_modules/**', '**/dist/**', 'coverage/**'],
    rules: { ...rules, 'no-restricted-imports': ['error', restrictedImports] },
    overrides: [
      {
        // The plugin's code. The migration kit is a one-off tool, outside the limits.
        files: ['api/**', 'ui/**'],
        rules: budgetRules,
      },
      ...budgetOverrides,
      {
        files: ['api/**'],
        env: { node: true },
      },
      {
        files: ['ui/**'],
        plugins: ['react', 'jsx-a11y'],
        env: { browser: true },
        rules: {
          ...browserRules,
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
        // Command-line tools that print to the terminal and read their settings.
        files: ['migration/**', 'scripts/**'],
        env: { node: true },
        rules: { 'no-console': 'off', 'node/no-process-env': 'off' },
      },
      {
        // Tools load these through their default export.
        files: ['vite.config.ts', 'api/drizzle.config.ts', 'ui/rsbuild.config.ts'],
        rules: { 'import/no-default-export': 'off' },
      },
    ],
  },
  test: {
    reporters: [...configDefaults.reporters, noSkips()],
    projects: [
      {
        root: 'api',
        test: {
          name: 'api',
          include: ['src/**/*.test.ts'],
          environment: 'node',
          setupFiles: ['src/test/setup.ts'],
          // config.ts needs these; tests never reach core.
          env: {
            CORE_URL: 'http://127.0.0.1:9',
            PLUGIN_SECRET: 'test-secret-'.padEnd(32, 'x'),
            LOG_LEVEL: 'silent',
          },
        },
      },
    ],
  },
});
