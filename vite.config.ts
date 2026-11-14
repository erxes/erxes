import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseEnv } from 'node:util';
import { preset } from '@erxes/lint';
import { configDefaults, defineConfig } from 'vite-plus';
import { areas } from './tools/config/areas';
import { designOverrides } from './tools/config/design';
import { exceptions } from './tools/config/exceptions';
import { restrictedOverrides, restrictedRules } from './tools/config/restricted';
import { coreRules } from './tools/config/core-rules';
import { apiTestEnv } from './tools/test/api-env';
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

// create-erxes's end-to-end test, a project of its own.
const e2e = 'src/__tests__/e2e.test.ts';

export default defineConfig({
  run: {
    tasks: {
      // A rerun with no edits replays the last result.
      check: {
        command: `${tsrs} vp check && knip && node tools/check-docs.ts && node tools/check-escapes.ts`,
        cache: tracked,
      },
      fix: { command: `${tsrs} vp check --fix`, cache: false },
      test: {
        command: 'vp test run',
        cache: { ...tracked, env: ['DATA_TEST_URL', 'CREATE_ERXES_PACKS'] },
      },
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
      'packages/contract/routes.json',
      'packages/ui/src/lib/cn-tables.ts',
      'packages/create-erxes/templates/**',
      'pnpm-lock.yaml',
    ],
  },
  // The rules every erxes repo shares come from @erxes/lint (packages/lint); tools/config adds
  // core's own. The preset's overrides follow a plugin's layout and match nothing here, apart
  // from the last, for tests, which areas' server rules come before.
  lint: {
    ...preset,
    jsPlugins: [...preset.jsPlugins, { name: 'core', specifier: './tools/lint/core.ts' }],
    // consumers/ installs the packed packages outside the workspace, so their imports
    // resolve only there; consumers/run.sh type-checks them (CI's packages job).
    // create-erxes's templates are code only once the CLI fills their names in; the
    // generated plugin's own check lints them (its e2e test).
    ignorePatterns: [
      'dist/**',
      'coverage/**',
      'consumers/**',
      'packages/create-erxes/templates/**',
      // Written by `cn build` (pnpm --filter @erxes/ui cn:tables), checked by check:generated.
      'packages/ui/src/lib/cn-tables.ts',
    ],
    rules: { ...preset.rules, ...coreRules, ...restrictedRules },
    overrides: [
      ...areas,
      ...designOverrides,
      ...restrictedOverrides,
      ...preset.overrides,
      ...exceptions,
    ],
  },
  test: {
    reporters: [...configDefaults.reporters, noSkips()],
    projects: [
      {
        root: 'apps/api',
        resolve: { tsconfigPaths: true },
        test: {
          name: 'api',
          include: ['src/**/*.test.ts'],
          environment: 'node',
          // Files run in parallel, each on its own copy of a template database that
          // globalSetup migrates once per run (src/__tests__/db.ts).
          globalSetup: [resolve(import.meta.dirname, 'apps/api/src/__tests__/globalSetup.ts')],
          env: apiTestEnv,
          // Generous: tests may run against a remote Postgres (each query is a round trip).
          testTimeout: 60_000,
          hookTimeout: 300_000,
        },
      },
      {
        root: 'apps/web',
        resolve: { tsconfigPaths: true },
        test: { name: 'web', include: ['src/**/*.test.ts'], environment: 'node' },
      },
      {
        root: 'packages/ui',
        test: { name: 'ui', include: ['src/**/*.test.ts'], environment: 'node' },
      },
      {
        root: 'packages/lint',
        test: { name: 'lint', include: ['src/**/*.test.ts'], environment: 'node' },
      },
      {
        root: 'packages/create-erxes',
        test: {
          name: 'create-erxes',
          include: ['src/**/*.test.ts'],
          exclude: [...configDefaults.exclude, e2e],
          environment: 'node',
        },
      },
      // Generates plugins with the packed CLI and runs their gates (CI's packages job): only
      // with CREATE_ERXES_PACKS, the directory of core's `pnpm pack` tarballs.
      ...(process.env.CREATE_ERXES_PACKS
        ? [
            {
              root: 'packages/create-erxes',
              test: {
                name: 'create-erxes-e2e',
                include: [e2e],
                environment: 'node',
                hookTimeout: 300_000,
              },
            },
          ]
        : []),
    ],
  },
});
