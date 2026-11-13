// What each part of the repo adds to the rules everyone gets: its runtime, React and
// accessibility in the browser, and the rules a part has adopted so far.
import type { OxlintConfig } from 'vite-plus/lint';

export const areas = [
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
    // Where settings come from the environment: core's config, CLIs, tests and build configs.
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
    // A query per item is an N+1: batch it (`inArray`, a set-based update), or go through
    // `inOrder`/`repeatWhile` (apps/core-api/src/lib/sequence.ts) on purpose.
    files: [
      'apps/core-api/**',
      'packages/contract/**',
      'packages/db/**',
      'packages/plugin-sdk/**',
      'packages/payment-gateways/**',
    ],
    rules: { 'no-await-in-loop': 'error' },
  },
  {
    // Row level security scopes every query to the organisation, so core adds no org_id filter.
    files: ['apps/core-api/**'],
    rules: { 'erxes/no-org-filter': 'error' },
  },
  {
    // A test takes its steps in order (a race, a session's lifetime); N+1s are a server concern.
    // Fixtures write through the owner's connection, outside any organisation's scope.
    files: ['**/__tests__/**', '**/*.test.ts', '**/*.test.tsx'],
    rules: { 'no-await-in-loop': 'off', 'erxes/no-org-filter': 'off' },
  },
] satisfies OxlintConfig['overrides'];
