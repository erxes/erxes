import { resolve } from 'node:path';
import { defineConfig } from 'vite-plus';

// Procedures are built from the contract in one place, so every route goes
// through the same context and access checks.
const routerBuilder = {
  name: '@orpc/server',
  importNames: ['implement', 'os'],
  message: 'Implement procedures in apps/core-api/src/router.ts, from the contract.',
};

// Packages are shared with plugins and never reach into an app.
const noApps = {
  group: [
    '@erxes/core-api',
    '@erxes/core-api/*',
    '@erxes/core-ui',
    '@erxes/core-ui/*',
    '**/apps/**',
  ],
  message: 'Packages and the UI never import an app. Move the shared code into a package.',
};

// Browser code runs without Node and without the database.
const serverOnly = {
  group: [
    '@erxes/core-db',
    '@erxes/core-db/*',
    'pg',
    'pg/*',
    'drizzle-orm',
    'drizzle-orm/*',
    'node:*',
  ],
  message: 'Browser code calls core through the contract client, never the database or Node.',
};

export default defineConfig({
  staged: {
    '*': 'vp check --fix',
  },
  fmt: {
    singleQuote: true,
    sortPackageJson: true,
    ignorePatterns: [
      'dist/**',
      'coverage/**',
      'packages/db/drizzle/**',
      'packages/contract/openapi.json',
      'docs/inventory/**',
      'pnpm-lock.yaml',
    ],
  },
  lint: {
    plugins: ['typescript', 'unicorn', 'oxc', 'import', 'vitest'],
    jsPlugins: [
      { name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' },
      { name: 'anti-slop', specifier: './tools/lint/anti-slop/index.ts' },
    ],
    categories: { correctness: 'error', suspicious: 'error' },
    options: { typeAware: true, typeCheck: true },
    ignorePatterns: ['dist/**', 'coverage/**'],
    rules: {
      'vite-plus/prefer-vite-plus-imports': 'error',
      'anti-slop/no-reduce-accumulator-copy': 'error',
      'anti-slop/no-object-parameters': 'error',
      'anti-slop/no-reflect-apply': 'error',
      'anti-slop/no-reflect-get': 'error',
      'anti-slop/no-shape-in-symbol-names': 'error',
      'anti-slop/no-unknown-type-aliases': 'error',
      'anti-slop/no-widen-then-assert': 'error',
      'anti-slop/require-readable-spacing': 'error',
      'no-unused-vars': 'error',
      'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
      'no-debugger': 'error',
      'no-restricted-imports': ['error', { paths: [routerBuilder] }],
      'import/no-default-export': 'error',
      'import/no-cycle': 'error',
      'oxc/no-barrel-file': 'error',
      'oxc/no-accumulating-spread': 'error',
      'typescript/no-explicit-any': 'error',
      'typescript/no-unsafe-assignment': 'error',
      'typescript/no-unsafe-argument': 'error',
      'typescript/no-unsafe-call': 'error',
      'typescript/no-unsafe-member-access': 'error',
      'typescript/no-unsafe-return': 'error',
      'typescript/no-unsafe-type-assertion': 'error',
      'typescript/no-floating-promises': 'error',
      'typescript/no-misused-promises': 'error',
      'typescript/switch-exhaustiveness-check': [
        'error',
        { considerDefaultExhaustiveForUnions: true },
      ],
    },
    overrides: [
      {
        files: ['apps/core-api/**', 'packages/db/**', 'tools/**'],
        env: { node: true },
      },
      {
        files: ['packages/contract/**', 'packages/db/**'],
        rules: {
          'no-restricted-imports': ['error', { paths: [routerBuilder], patterns: [noApps] }],
        },
      },
      {
        files: ['apps/core-ui/src/**', 'packages/ui/**', 'packages/ui-modules/**'],
        plugins: ['react'],
        env: { browser: true },
        rules: {
          'react/rules-of-hooks': 'error',
          // The automatic JSX runtime (jsx: react-jsx) needs no React in scope.
          'react/react-in-jsx-scope': 'off',
          'import/no-unassigned-import': ['error', { allow: ['**/*.css'] }],
          'no-restricted-imports': [
            'error',
            { paths: [routerBuilder], patterns: [noApps, serverOnly] },
          ],
        },
      },
      {
        files: ['apps/core-api/src/router.ts'],
        rules: { 'no-restricted-imports': 'off' },
      },
      {
        // Tools load these through their default export.
        files: [
          'vite.config.ts',
          'knip.ts',
          'apps/core-api/tsup.config.ts',
          'apps/core-ui/rsbuild.config.ts',
          'packages/db/drizzle.config.ts',
          'tools/lint/*/index.ts',
          'tools/lint/anti-slop/vendor/**',
        ],
        rules: { 'import/no-default-export': 'off' },
      },
    ],
  },
  test: {
    projects: [
      {
        root: 'apps/core-api',
        resolve: { tsconfigPaths: true },
        test: {
          name: 'core-api',
          include: ['src/**/*.test.ts'],
          environment: 'node',
          // Each test file gets its own throwaway database (src/__tests__/db.ts).
          fileParallelism: false,
          env: {
            // A plugin key for the plugin-only endpoints (notifications, activities).
            CORE_PLUGIN_KEYS: 'hr:test-hr-plugin-key-0123456789abcdefghijklmnop',
            FILES_STORAGE: 'local',
            FILES_LOCAL_DIR: resolve(import.meta.dirname, 'apps/core-api/.test-files'),
            FILES_MAX_SIZE_MB: '5',
            CORE_SIGNING_KEY_DEV_FILE: resolve(import.meta.dirname, 'apps/core-api/.test-files/keys/signing-key.pem'),
          },
          // Generous: tests may run against a remote Postgres (each query is a round trip).
          testTimeout: 60_000,
          hookTimeout: 60_000,
        },
      },
      {
        root: 'apps/core-ui',
        resolve: { tsconfigPaths: true },
        test: { name: 'core-ui', include: ['src/**/*.test.ts'], environment: 'node' },
      },
      {
        root: 'packages/ui',
        test: { name: 'ui', include: ['src/**/*.test.ts'], environment: 'node' },
      },
      {
        root: 'tools/lint',
        test: { name: 'lint', include: ['**/*.test.ts'], environment: 'node' },
      },
    ],
  },
});
