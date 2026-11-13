import { resolve } from 'node:path';
import { configDefaults, defineConfig } from 'vite-plus';
import {
  decided,
  noApps,
  noDriver,
  nodeCrypto,
  oneTransaction,
  routerBuilder,
  serverOnly,
} from './tools/lint/restricted';
import { coreApiTestEnv } from './tools/test/core-api-env';
import { noSkips } from './tools/test/no-skips';

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
      'packages/contract/routes.json',
      'pnpm-lock.yaml',
    ],
  },
  lint: {
    plugins: ['typescript', 'unicorn', 'oxc', 'import', 'vitest', 'promise', 'node'],
    jsPlugins: [
      { name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' },
      { name: 'anti-slop', specifier: './tools/lint/anti-slop/index.ts' },
      { name: 'erxes', specifier: './tools/lint/erxes/index.ts' },
    ],
    categories: { correctness: 'error', suspicious: 'error' },
    options: { typeAware: true, typeCheck: true },
    // consumers/ installs the packed packages outside the workspace, so their imports
    // resolve only there; consumers/run.sh type-checks them (CI's packages job).
    ignorePatterns: ['dist/**', 'coverage/**', 'consumers/**'],
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
      // A malformed token claim must fail verification, never fall back to a value.
      'anti-slop/no-zod-catch': 'error',
      'erxes/no-session-advisory-lock': 'error',
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
          '{tools,e2e}/**',
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
          '{tools,e2e}/**',
          'vite.config.ts',
        ],
        rules: { 'node/no-process-env': 'off' },
      },
      {
        files: [
          'packages/contract/**',
          'packages/db/**',
          'packages/plugin-sdk/**',
          'packages/payment-gateways/**',
        ],
        rules: {
          'no-restricted-imports': [
            'error',
            { paths: [routerBuilder, ...decided], patterns: [noApps] },
          ],
          'no-await-in-loop': 'error',
        },
      },
      {
        // Table definitions ship inside the published contract (noDriver).
        files: [
          'packages/db/src/schema/**',
          'packages/db/src/table.ts',
          'packages/db/src/enums.ts',
        ],
        rules: {
          'no-restricted-imports': ['error', { paths: decided, patterns: [noApps, noDriver] }],
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
        // Value lists are written once, in packages/db/src/enums.ts.
        files: [
          'apps/core-api/**',
          'apps/core-ui/**',
          'packages/db/**',
          'packages/contract/**',
          'packages/plugin-sdk/**',
          'packages/ui/**',
        ],
        rules: { 'erxes/no-inline-enum': 'error' },
      },
      {
        files: ['packages/db/src/enums.ts'],
        rules: { 'erxes/no-inline-enum': 'off' },
      },
      {
        // Core's hashing, comparisons and random tokens all go through lib/crypto.ts, and its
        // transactions through withOrg/withSystem and savepoint().
        // A query per item is an N+1 (here and in the packages above): batch it (`inArray`, a
        // set-based update), or go through `inOrder`/`repeatWhile` (src/lib/sequence.ts) on purpose.
        files: ['apps/core-api/**'],
        rules: {
          'no-restricted-imports': ['error', { paths: [routerBuilder, ...decided, ...nodeCrypto] }],
          'no-await-in-loop': 'error',
          'no-restricted-properties': ['error', oneTransaction],
          'erxes/no-org-filter': 'error',
        },
      },
      {
        files: ['apps/core-api/src/lib/crypto.ts'],
        rules: { 'no-restricted-imports': ['error', { paths: [routerBuilder, ...decided] }] },
      },
      {
        // The one place that implements the contract; feature routers import its builders.
        files: ['apps/core-api/src/orpc.ts'],
        rules: { 'no-restricted-imports': ['error', { paths: [...decided, ...nodeCrypto] }] },
      },
      {
        // A test file's describe callback holds all its cases; max-lines still bounds the file.
        // A test takes its steps in order (a race, a session's lifetime); N+1s are a server concern.
        // Fixtures write through the owner's connection, outside any scope (`.transaction()`).
        files: ['**/__tests__/**', '**/*.test.ts', '**/*.test.tsx'],
        rules: {
          'max-lines-per-function': 'off',
          'no-await-in-loop': 'off',
          'no-restricted-properties': 'off',
          'erxes/no-org-filter': 'off',
        },
      },
      {
        // Tools load these through their default export.
        files: [
          'vite.config.ts',
          'knip.ts',
          '**/{tsdown,playwright}.config.ts',
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
          // Files run in parallel, each on its own copy of a template database that
          // globalSetup migrates once per run (src/__tests__/db.ts).
          globalSetup: [resolve(import.meta.dirname, 'apps/core-api/src/__tests__/globalSetup.ts')],
          env: coreApiTestEnv,
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
