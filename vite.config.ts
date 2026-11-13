import { resolve } from 'node:path';
import { configDefaults, defineConfig } from 'vite-plus';
import { noSkips } from './tools/test/no-skips';

// Procedures are built from the contract in one place, so every route goes
// through the same context and access checks.
const routerBuilder = {
  name: '@orpc/server',
  importNames: ['implement', 'os'],
  message:
    'Build procedures with the builders from apps/core-api/src/orpc.ts, in modules/<feature>/<feature>.router.ts.',
};

// Decisions recorded as bans: each message says what to use instead.
const decided = [
  {
    name: 'graphile-worker',
    message: 'Durable work goes through core_jobs (apps/core-api/src/modules/jobs).',
  },
  {
    name: 'bullmq',
    message: 'Durable work goes through core_jobs (apps/core-api/src/modules/jobs).',
  },
  {
    name: 'ioredis',
    message: 'Realtime is the Postgres LISTEN/NOTIFY hub (modules/live); core has no Redis.',
  },
  {
    name: 'redis',
    message: 'Realtime is the Postgres LISTEN/NOTIFY hub (modules/live); core has no Redis.',
  },
  {
    name: '@apollo/client',
    message: 'Core has no GraphQL. Call core through the typed oRPC client.',
  },
  { name: 'graphql', message: 'Core has no GraphQL. Call core through the typed oRPC client.' },
  { name: 'dayjs', message: 'One date library: date-fns.' },
  { name: 'moment', message: 'One date library: date-fns.' },
  { name: 'axios', message: 'Use fetch on the server and the typed oRPC client in the browser.' },
  { name: 'lodash', message: 'Use the platform (Array, Object, structuredClone) or es-toolkit.' },
];

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
      'pnpm-lock.yaml',
    ],
  },
  lint: {
    plugins: ['typescript', 'unicorn', 'oxc', 'import', 'vitest', 'promise', 'node'],
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
      // `const { secret, ...rest } = row` drops a field on purpose; Express
      // error handlers need all four parameters (`_next`).
      'no-unused-vars': ['error', { ignoreRestSiblings: true, argsIgnorePattern: '^_' }],
      // Servers log through pino (apps/core-api/src/logger.ts); CLIs write to process.stdout.
      'no-console': 'error',
      'no-debugger': 'error',
      'no-restricted-imports': ['error', { paths: [routerBuilder, ...decided] }],
      'import/no-default-export': 'error',
      'import/no-duplicates': 'error',
      'import/no-self-import': 'error',
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
      'typescript/no-non-null-assertion': 'error',
      'typescript/ban-ts-comment': 'error',
      'typescript/no-deprecated': 'error',
      'typescript/only-throw-error': 'error',
      'typescript/prefer-promise-reject-errors': 'error',
      'typescript/return-await': ['error', 'in-try-catch'],
      // `name || email`: an empty string falls back on purpose; for other types `??` is meant.
      'typescript/prefer-nullish-coalescing': ['error', { ignorePrimitives: { string: true } }],
      'typescript/consistent-type-imports': 'error',
      'unicorn/prefer-node-protocol': 'error',
      'unicorn/throw-new-error': 'error',
      // An automation branch step's `then` arm is a stored list of steps (the definition
      // format in the contract and the database), never a function.
      'unicorn/no-thenable': 'off',
      eqeqeq: ['error', 'smart'],
      'no-param-reassign': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      // No TODO/FIXME/XXX left in code: finish it or don't write it.
      'no-warning-comments': 'error',
      // Big files are where agents pile up unrelated code, and every agent reads a file whole.
      // Split by responsibility (a feature's router, service, queries), not into part1/part2.
      'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': [
        'error',
        { max: 80, skipBlankLines: true, skipComments: true, IIFEs: true },
      ],
      // Express 5 passes a rejected handler promise to the error handler, so async
      // route handlers are safe; the rule guards Express 4.
      'oxc/no-async-endpoint-handlers': 'off',
      // Settings are read once, validated, in apps/core-api/src/config.ts.
      'node/no-process-env': 'error',
      // noImplicitReturns in tsconfig.base.json checks this with types, so exhaustive switches pass.
      'typescript/consistent-return': 'off',
      'typescript/switch-exhaustiveness-check': [
        'error',
        { considerDefaultExhaustiveForUnions: true },
      ],
    },
    overrides: [
      {
        files: [
          'apps/core-api/**',
          'packages/db/**',
          'packages/plugin-sdk/**',
          'packages/payment-gateways/**',
          'tools/**',
        ],
        env: { node: true },
      },
      {
        // Where settings come from the environment: core's config, CLIs and tests.
        files: [
          'apps/core-api/src/config.ts',
          'apps/core-api/scripts/**',
          'apps/core-api/src/__tests__/**',
          'packages/db/drizzle.config.ts',
          'tools/**',
          'vite.config.ts',
        ],
        rules: { 'node/no-process-env': 'off' },
      },
      {
        files: ['packages/contract/**', 'packages/db/**'],
        rules: {
          'no-restricted-imports': [
            'error',
            { paths: [routerBuilder, ...decided], patterns: [noApps] },
          ],
        },
      },
      {
        files: ['apps/core-ui/src/**', 'packages/ui/**'],
        plugins: ['react', 'jsx-a11y'],
        env: { browser: true },
        rules: {
          'react/rules-of-hooks': 'error',
          'react/exhaustive-deps': 'error',
          'react/no-unstable-nested-components': 'error',
          'react/purity': 'error',
          'react/refs': 'error',
          'react/immutability': 'error',
          'react/set-state-in-effect': 'error',
          'react/no-array-index-key': 'error',
          'react/no-danger': 'error',
          'react/iframe-missing-sandbox': 'error',
          // The automatic JSX runtime (jsx: react-jsx) needs no React in scope.
          'react/react-in-jsx-scope': 'off',
          'import/no-unassigned-import': ['error', { allow: ['**/*.css'] }],
          'no-restricted-imports': [
            'error',
            { paths: [routerBuilder, ...decided], patterns: [noApps, serverOnly] },
          ],
        },
      },
      {
        // The browser's console is where a page's problems show up.
        files: ['apps/core-ui/src/**'],
        rules: { 'no-console': ['error', { allow: ['warn', 'error'] }] },
      },
      {
        // The one place that implements the contract; feature routers import its builders.
        files: ['apps/core-api/src/orpc.ts'],
        rules: { 'no-restricted-imports': 'off' },
      },
      {
        // A test file's describe callback holds all its cases; max-lines still bounds the file.
        files: ['**/__tests__/**', '**/*.test.ts', '**/*.test.tsx'],
        rules: { 'max-lines-per-function': 'off' },
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
      {
        // Each package's one public entry (package.json `exports`), and the
        // schema module drizzle-kit and the client load whole. Phase 2 splits
        // the contract into subpath exports.
        files: [
          'packages/contract/src/index.ts',
          'packages/db/src/index.ts',
          'packages/db/src/schema/index.ts',
          'packages/plugin-sdk/src/index.ts',
        ],
        rules: { 'oxc/no-barrel-file': 'off' },
      },
      {
        // Copied from the HR plugin (and ESLint Stylistic in vendor/). Kept as
        // upstream wrote it so the copies stay easy to compare.
        files: ['tools/lint/anti-slop/**'],
        rules: {
          'typescript/no-unsafe-type-assertion': 'off',
          'no-shadow': 'off',
          'no-underscore-dangle': 'off',
        },
      },
      {
        // ESLint Stylistic's rule, vendored unchanged (see its UPSTREAM.md): splitting or
        // rewriting it would make upstream fixes hard to carry over.
        files: ['tools/lint/anti-slop/vendor/**'],
        rules: {
          'max-lines': 'off',
          'max-lines-per-function': 'off',
          'typescript/no-non-null-assertion': 'off',
        },
      },
    ],
  },
  test: {
    reporters: [...configDefaults.reporters, noSkips()],
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
            // Low lines, so tests reach them quickly.
            MASS_DELETE_ALERT: '20',
            MASS_DELETE_LIMIT: '40',
            FAILED_SIGN_IN_ALERT: '3',
            CORE_SIGNING_KEY_DEV_FILE: resolve(
              import.meta.dirname,
              'apps/core-api/.test-files/keys/signing-key.pem',
            ),
            // logging.test.ts logs to its own destination.
            LOG_LEVEL: 'silent',
          },
          // Generous: tests may run against a remote Postgres (each query is a round trip).
          testTimeout: 60_000,
          hookTimeout: 300_000,
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
