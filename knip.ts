import type { KnipConfig } from 'knip';

// Unused files, exports and dependencies fail `pnpm check`.
const config: KnipConfig = {
  workspaces: {
    '.': {
      entry: ['tools/lint/*/rules/*.test.ts'],
      project: ['tools/**/*.ts'],
      // Copied from the HR plugin as a whole, with its vendored ESLint Stylistic rule.
      ignore: ['tools/lint/anti-slop/**'],
    },
    // Entries from package.json (main, exports), rsbuild.config.ts and tsup.config.ts count too.
    'apps/core-api': {
      entry: ['scripts/*.ts', 'src/**/*.test.ts'],
      project: ['src/**/*.ts', 'scripts/**/*.ts'],
    },
    'apps/core-ui': {
      project: ['src/**/*.{ts,tsx,css}'],
      // Provided to 3.x plugin UIs through Module Federation (SHARED in rsbuild.config.ts), named
      // there as a string knip can't follow; graphql is @apollo/client's peer. core-ui imports neither.
      ignoreDependencies: ['@apollo/client', 'graphql'],
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
    },
  },
};

export default config;
