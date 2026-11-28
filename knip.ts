import type { KnipConfig } from 'knip';

// Unused files, exports and dependencies fail `vp run check`.
const config: KnipConfig = {
  workspaces: {
    '.': {
      // tools/*.ts are scripts the vp tasks in vite.config.ts run with node; tools/mutation/*.ts
      // are what .github/workflows/mutation.yml runs and loads into Stryker.
      entry: ['tools/*.ts', 'tools/mutation/*.ts'],
      project: ['tools/**/*.ts', 'e2e/**/*.ts'],
      // The daily flows in Chromium (pnpm e2e); the config names the specs and the setup file.
      playwright: {
        config: ['e2e/playwright.config.ts'],
        entry: ['e2e/*.spec.ts', 'e2e/*.setup.ts'],
      },
      // The check task runs these: oxlint calls tsrs-lint through OXLINT_TSGOLINT_PATH, jscpd
      // reads .jscpd.json and react-doctor reads doctor.config.jsonc.
      ignoreDependencies: ['tsrs', 'jscpd', 'react-doctor'],
      // mutation.yml installs Stryker on the runner, for core and every plugin alike.
      ignoreBinaries: ['stryker'],
    },
    // Entries from package.json (main, exports), rsbuild.config.ts and tsdown.config.ts count too.
    'apps/api': {
      entry: ['scripts/*.ts', 'src/**/*.test.ts'],
      project: ['src/**/*.ts', 'scripts/**/*.ts'],
    },
    'apps/web': {
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
    'packages/integrations': {
      project: ['src/**/*.ts'],
    },
    'packages/lint': {
      entry: ['src/**/*.test.ts'],
      project: ['src/**/*.ts'],
      // Copied from the HR plugin as a whole, with its vendored ESLint Stylistic rule.
      ignore: ['src/anti-slop/**'],
    },
    // templates/ are the files a new plugin starts from, not this package's code.
    'packages/create-erxes': {
      project: ['src/**/*.ts', 'scripts/**/*.ts'],
      ignore: ['templates/**'],
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
