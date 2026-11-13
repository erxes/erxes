import type { KnipConfig } from 'knip';

// Unused files, exports and dependencies fail `pnpm check`.
const config: KnipConfig = {
  workspaces: {
    '.': {
      entry: ['tools/lint/*/rules/*.test.ts'],
      project: ['tools/**/*.ts', 'e2e/**/*.ts'],
      // The daily flows in Chromium (pnpm e2e); the config names the specs and the setup file.
      playwright: {
        config: ['e2e/playwright.config.ts'],
        entry: ['e2e/*.spec.ts', 'e2e/*.setup.ts'],
      },
      // Copied from the HR plugin as a whole, with its vendored ESLint Stylistic rule.
      ignore: ['tools/lint/anti-slop/**'],
      // Oxlint runs its tsrs-lint binary through OXLINT_TSGOLINT_PATH in the check scripts.
      ignoreDependencies: ['tsrs'],
    },
    // Entries from package.json (main, exports), rsbuild.config.ts and tsdown.config.ts count too.
    'apps/core-api': {
      entry: ['scripts/*.ts', 'src/**/*.test.ts'],
      project: ['src/**/*.ts', 'scripts/**/*.ts'],
    },
    'apps/core-ui': {
      // The opt-in perf scripts, run by hand with `pnpm perf` and `pnpm perf:seed`.
      entry: ['e2e/perf/*.ts'],
      project: ['src/**/*.{ts,tsx,css}', 'e2e/**/*.ts'],
    },
    'packages/contract': {
      project: ['src/**/*.ts'],
    },
    'packages/db': {
      project: ['src/**/*.ts'],
    },
    'packages/plugin-sdk': {
      project: ['src/**/*.ts'],
    },
    // erxes-ui is shared with plugin UIs: every file under
    // src/ is a public entry (package.json `exports`), so their exports count as used.
    'packages/ui': {
      entry: ['src/**/*.{ts,tsx,css}'],
      project: ['src/**/*.{ts,tsx,css}'],
      // The package is @erxes/ui but imports itself as erxes-ui through tsconfig.json
      // `paths`, as its consumers do; tsdown rewrites those to relative.
      ignoreDependencies: ['erxes-ui'],
    },
  },
};

export default config;
