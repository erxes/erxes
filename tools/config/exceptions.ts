// The files a rule is off for, each with the reason. A new entry is a rule change: it goes
// in its own PR, never in the PR whose code the rule rejected.
import type { OxlintConfig } from 'vite-plus/lint';

export const exceptions = [
  {
    // The one file that writes the value lists out.
    files: ['packages/db/src/enums.ts'],
    rules: { 'erxes/no-inline-enum': 'off' },
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
    // ESLint Stylistic's rule, vendored unchanged (see its UPSTREAM.md).
    files: ['tools/lint/anti-slop/vendor/**'],
    rules: { 'typescript/no-non-null-assertion': 'off' },
  },
] satisfies OxlintConfig['overrides'];
