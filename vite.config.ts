import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseEnv } from 'node:util';
import { configDefaults, defineConfig } from 'vite-plus';
import { areas } from './tools/config/areas';
import { budgetOverrides, budgetRules } from './tools/config/budgets';
import { exceptions } from './tools/config/exceptions';
import { restrictedOverrides, restrictedRules } from './tools/config/restricted';
import { rules } from './tools/config/rules';
import { coreApiTestEnv } from './tools/test/core-api-env';
import { noSkips } from './tools/test/no-skips';

// The type check is tsrs (TypeScript 7) running as oxlint's tsgolint.
const tsrs = 'OXLINT_TSGOLINT_PATH=node_modules/.bin/tsrs-lint';

// Vite Task tracks the files each command reads; the lockfile is listed too, so an
// install that changes a dependency always reruns the task.
const tracked = { input: [{ auto: true }, 'pnpm-lock.yaml'] };

// `vp run dev:stack up` writes the test Postgres here; a DATA_TEST_URL set in the shell wins.
const localEnv = resolve(import.meta.dirname, '.env.local');

const localTestUrl = existsSync(localEnv)
  ? parseEnv(readFileSync(localEnv, 'utf8')).DATA_TEST_URL
  : undefined;

if (localTestUrl) process.env.DATA_TEST_URL ??= localTestUrl;

export default defineConfig({
  run: {
    tasks: {
      // A rerun with no edits replays the last result.
      check: {
        command: `${tsrs} vp check && knip && node tools/check-docs.ts && node tools/check-escapes.ts`,
        cache: tracked,
      },
      fix: { command: `${tsrs} vp check --fix`, cache: false },
      test: { command: 'vp test run', cache: { ...tracked, env: ['DATA_TEST_URL'] } },
      // A Postgres, API and UI for this checkout (tools/dev-stack.ts), and what it needs.
      'dev:stack': { command: 'node tools/dev-stack.ts', cache: false },
      doctor: { command: 'node tools/doctor.ts', cache: false },
    },
  },
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
    rules: { ...rules, ...restrictedRules, ...budgetRules },
    overrides: [...areas, ...restrictedOverrides, ...budgetOverrides, ...exceptions],
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
