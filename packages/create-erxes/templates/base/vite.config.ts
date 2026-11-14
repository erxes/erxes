import { resolve } from 'node:path';
import { preset } from '@erxes/lint';
import { configDefaults, defineConfig } from 'vite-plus';
import { noSkips } from './tools/test/no-skips.ts';

// The type check is tsrs (TypeScript 7) running as oxlint's tsgolint.
const tsrs = 'OXLINT_TSGOLINT_PATH=node_modules/.bin/tsrs-lint';

// Vite Task tracks the files each command reads; the lockfile is listed too, so an
// install that changes a dependency always reruns the task.
const tracked = { input: [{ auto: true }, 'pnpm-lock.yaml'] };

export default defineConfig({
  run: {
    tasks: {
      // A rerun with no edits replays the last result.
      check: {
        command: `erxes-check-escapes && ${tsrs} vp check && knip && erxes-check-docs && pnpm check:generated`,
        cache: tracked,
      },
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
      'api/openapi.json',
      'pnpm-lock.yaml',
    ],
  },
  // The rules core and every plugin share, with the overrides for a plugin's api/, ui/ and
  // migration kit. Change them in core's packages/lint; a new @erxes/lint brings them here.
  lint: {
    ...preset,
    ignorePatterns: ['**/node_modules/**', '**/dist/**', 'coverage/**'],
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
          setupFiles: [resolve(import.meta.dirname, 'api/src/test/setup.ts')],
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
