import { resolve } from 'node:path';
import { configDefaults, defineConfig } from 'vite-plus';
import type { OxlintOverride } from 'vite-plus/lint';
import type { Reporter, Vitest } from 'vite-plus/test/node';

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

// packages/ui is erxes-ui copied from old erxes. Phase 2 rewrites it and
// removes this override. Until then the rules it fails are warnings there, so
// new code stays at error. packages/ui-modules passes at error.
const inheritedUi = {
  files: ['packages/ui/**'],
  plugins: ['react'],
  rules: {
    'import/no-cycle': 'warn',
    'import/no-default-export': 'warn',
    'no-console': 'warn',
    'no-shadow': 'warn',
    'no-underscore-dangle': 'warn',
    'no-unsafe-optional-chaining': 'warn',
    'no-unused-expressions': 'warn',
    'no-unused-vars': 'warn',
    'oxc/const-comparisons': 'warn',
    'oxc/no-accumulating-spread': 'warn',
    'oxc/no-barrel-file': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'react/exhaustive-effect-dependencies': 'warn',
    'react/iframe-missing-sandbox': 'warn',
    'react/immutability': 'warn',
    'react/incompatible-library': 'warn',
    'react/memo-dependencies': 'warn',
    'react/no-unstable-nested-components': 'warn',
    'react/purity': 'warn',
    'react/refs': 'warn',
    'react/set-state-in-effect': 'warn',
    'typescript/no-base-to-string': 'warn',
    'typescript/no-explicit-any': 'warn',
    'typescript/no-floating-promises': 'warn',
    'typescript/no-misused-promises': 'warn',
    'typescript/no-misused-spread': 'warn',
    'typescript/no-unnecessary-type-conversion': 'warn',
    'typescript/no-unnecessary-type-parameters': 'warn',
    'typescript/no-unsafe-argument': 'warn',
    'typescript/no-unsafe-assignment': 'warn',
    'typescript/no-unsafe-call': 'warn',
    'typescript/no-unsafe-enum-assignment': 'warn',
    'typescript/no-unsafe-enum-comparison': 'warn',
    'typescript/no-unsafe-member-access': 'warn',
    'typescript/no-unsafe-return': 'warn',
    'typescript/no-unsafe-type-assertion': 'warn',
    'typescript/no-useless-default-assignment': 'warn',
    'typescript/restrict-template-expressions': 'warn',
    'typescript/unbound-method': 'warn',
    'unicorn/consistent-function-scoping': 'warn',
    'unicorn/no-array-sort': 'warn',
    'unicorn/prefer-add-event-listener': 'warn',
  },
} satisfies OxlintOverride;

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

/**
 * A skipped test passes in Vitest, so this reporter fails the run on any
 * skipped, pending or todo test or suite (`.skip`, `skipIf`, `ctx.skip()`,
 * `.todo`), and on a project whose files all ran without a test. A run
 * filtered with `-t` skips what it doesn't match, so only the project rule
 * applies then; a run of some files never checks the other projects.
 */
const noSkips = (): Reporter => {
  let vitest: Vitest | undefined;

  return {
    onInit(ctx) {
      vitest = ctx;
    },
    async onTestRunEnd(modules) {
      if (!vitest) return;

      const problems: string[] = [];

      if (!vitest.config.testNamePattern) {
        for (const module of modules) {
          for (const suite of module.children.allSuites()) {
            const state = suite.state();

            if (state === 'skipped' || state === 'pending') {
              problems.push(`${state} suite: ${suite.fullName} (${module.relativeModuleId})`);
            }
          }

          for (const test of module.children.allTests()) {
            const { state } = test.result();

            if (state === 'skipped' || state === 'pending') {
              problems.push(`${state} test: ${test.fullName} (${module.relativeModuleId})`);
            }
          }
        }
      }

      for (const project of vitest.projects) {
        const ran = modules.filter((module) => module.project.name === project.name);
        const { testFiles } = await project.globTestFiles();

        const tests = ran.flatMap((module) => [...module.children.allTests()]);

        if (
          ran.length === testFiles.length &&
          !tests.some((test) => test.result().state !== 'skipped')
        ) {
          problems.push(`project ${project.name} ran no tests`);
        }
      }

      if (problems.length) {
        process.exitCode = 1;
        vitest.logger.error(['Tests must run, not skip:', ...problems].join('\n  '));
      }
    },
  };
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
      // `const { secret, ...rest } = row` drops a field on purpose; Express
      // error handlers need all four parameters (`_next`).
      'no-unused-vars': ['error', { ignoreRestSiblings: true, argsIgnorePattern: '^_' }],
      // Servers log through pino (apps/core-api/src/logger.ts); CLIs write to process.stdout.
      'no-console': 'error',
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
      // noImplicitReturns in tsconfig.base.json checks this with types, so exhaustive switches pass.
      'typescript/consistent-return': 'off',
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
        // The browser's console is where a page's problems show up.
        files: ['apps/core-ui/src/**'],
        rules: { 'no-console': ['error', { allow: ['warn', 'error'] }] },
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
      {
        // Each package's one public entry (package.json `exports`), and the
        // schema module drizzle-kit and the client load whole. Phase 2 splits
        // the contract into subpath exports.
        files: [
          'packages/contract/src/index.ts',
          'packages/db/src/index.ts',
          'packages/db/src/schema/index.ts',
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
      inheritedUi,
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
            CORE_SIGNING_KEY_DEV_FILE: resolve(
              import.meta.dirname,
              'apps/core-api/.test-files/keys/signing-key.pem',
            ),
            // logging.test.ts logs to its own destination.
            LOG_LEVEL: 'silent',
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
