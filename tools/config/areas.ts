// What each part of the repo adds to the rules everyone gets: its runtime, React and
// accessibility in the browser, and the rules a part has adopted so far. @erxes/lint's
// preset turns the server rules back off in tests.
import { browserRules } from '@erxes/lint';
import type { OxlintConfig } from 'vite-plus/lint';

export const areas = [
  {
    files: [
      'apps/api/**',
      'packages/db/**',
      'packages/plugin-sdk/**',
      'packages/payment-gateways/**',
      'packages/create-erxes/**',
      '{tools,e2e}/**',
    ],
    env: { node: true },
  },
  {
    // Where settings come from the environment: core's config, CLIs, tests and build configs.
    files: [
      'apps/api/src/config.ts',
      'apps/api/scripts/**',
      'apps/api/src/__tests__/**',
      'packages/create-erxes/src/existing-plugins.ts',
      'packages/create-erxes/src/__tests__/**',
      'packages/db/drizzle.config.ts',
      'apps/web/rsbuild.config.ts',
      '{tools,e2e}/**',
      'vite.config.ts',
    ],
    rules: { 'node/no-process-env': 'off' },
  },
  {
    files: ['apps/web/src/**', 'packages/ui/**'],
    plugins: ['react', 'jsx-a11y'],
    env: { browser: true },
    rules: {
      ...browserRules,
      // Addresses come from apps/web/src/lib/paths.ts, never written out in a link.
      'core/no-string-link': 'error',
    },
  },
  {
    // The browser's console is where a page's problems show up.
    files: ['apps/web/src/**'],
    rules: { 'no-console': ['error', { allow: ['warn', 'error'] }] },
  },
  {
    // Value lists are written once, in packages/db/src/enums.ts.
    files: [
      'apps/api/**',
      'apps/web/**',
      'packages/db/**',
      'packages/contract/**',
      'packages/plugin-sdk/**',
      'packages/ui/**',
    ],
    rules: { 'core/no-inline-enum': 'error' },
  },
  {
    // A query per item is an N+1: batch it (`inArray`, a set-based update), or go through
    // `inOrder`/`repeatWhile` (apps/api/src/lib/sequence.ts) on purpose.
    files: [
      'apps/api/**',
      'packages/contract/**',
      'packages/db/**',
      'packages/plugin-sdk/**',
      'packages/payment-gateways/**',
    ],
    rules: { 'no-await-in-loop': 'error' },
  },
  {
    // Row level security scopes every query to the organisation, so core adds no org_id filter.
    files: ['apps/api/**'],
    rules: {
      'erxes/no-org-filter': 'error',
      // Services return rows; a value the row lacks comes from the query's select.
      'erxes/no-dto-mapper': 'error',
      // Drizzle's .set() and .values() skip undefined keys.
      'erxes/no-undefined-spread': 'error',
    },
  },
  {
    // A procedure's permission is its ACCESS policy (src/http/policies.ts), checked before it runs.
    files: ['apps/api/src/modules/**'],
    rules: { 'core/no-service-permission': 'error' },
  },
] satisfies OxlintConfig['overrides'];
