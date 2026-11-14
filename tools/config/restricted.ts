// The `no-restricted-imports`, `-properties` and `-globals` entries each part of the repo
// gets, and where it gets them.
import type { OxlintConfig } from 'vite-plus/lint';

// Procedures are built from the contract in one place, so every route goes
// through the same context and access checks.
const routerBuilder = {
  name: '@orpc/server',
  importNames: ['implement', 'os'],
  message:
    'Build procedures with the builders from apps/api/src/orpc.ts, in modules/<feature>/<feature>.router.ts.',
};

// Decisions recorded as bans: each message says what to use instead.
const decided = [
  {
    name: 'graphile-worker',
    message: 'Durable work goes through pg-boss (apps/api/src/modules/jobs).',
  },
  {
    name: 'bullmq',
    message: 'Durable work goes through pg-boss (apps/api/src/modules/jobs).',
  },
  {
    name: 'ioredis',
    message: 'Realtime is the Postgres LISTEN/NOTIFY hub (modules/live); core has no Redis.',
  },
  {
    name: 'redis',
    message: 'Realtime is the Postgres LISTEN/NOTIFY hub (modules/live); core has no Redis.',
  },
  {
    name: '@apollo/client',
    message: 'Core has no GraphQL. Call core through the typed oRPC client.',
  },
  { name: 'graphql', message: 'Core has no GraphQL. Call core through the typed oRPC client.' },
  { name: 'dayjs', message: 'One date library: date-fns.' },
  { name: 'moment', message: 'One date library: date-fns.' },
  { name: 'axios', message: 'Use fetch on the server and the typed oRPC client in the browser.' },
  { name: 'lodash', message: 'Use the platform (Array, Object, structuredClone) or es-toolkit.' },
  ...['zod/v3', 'zod/v4-mini', 'zod/mini'].map((name) => ({
    name,
    message: "One zod: import { z } from 'zod' (zod 4 classic).",
  })),
  { name: 'react', importNames: ['forwardRef'], message: 'React 19: take ref from the props.' },
  { name: 'react-merge-refs', message: "Merge refs with mergeRefs from 'erxes-ui/lib/utils'." },
  ...['radix-ui', 'react-aria-components'].map((name) => ({
    name,
    message:
      'Primitives come from Base UI (@base-ui/react), wrapped in packages/ui/src/components.',
  })),
];

// A stored hash, signature or token keeps its format only if one file makes it.
const nodeCrypto = ['node:crypto', 'crypto'].map((name) => ({
  name,
  message:
    'Use apps/api/src/lib/crypto.ts (safeEqual, sha256, hmacSha256, randomToken), or add the helper there.',
}));

// Packages are shared with plugins and never reach into an app.
const noApps = {
  group: ['@erxes/api', '@erxes/api/*', '@erxes/web', '@erxes/web/*', '**/apps/**'],
  message: 'Packages and the UI never import an app. Move the shared code into a package.',
};

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

// The contract builds its schemas from the tables (`@erxes/core-db/schema`) and
// its published build copies them into dist, so table definitions import drizzle's
// column builders, `../table`, `../enums`, `../automationDefinition` (zod over the enums)
// and nothing that needs Node or a database.
const noDriver = {
  group: [
    'pg',
    'pg/*',
    'node:*',
    'drizzle-orm/node-postgres',
    '../*',
    '!../table',
    '!../enums',
    '!../automationDefinition',
  ],
  message: 'Table definitions ship inside the published contract: no Node, driver or client.',
};

// A request or job already runs in one transaction (withOrg / withSystem), so a nested
// `.transaction()` only adds a savepoint, and that has one name.
const oneTransaction = {
  property: 'transaction',
  message:
    "The request's withOrg/withSystem scope is already one transaction. To undo only part of it when you catch its error, use savepoint() from @erxes/core-db.",
};

// Work on a clock is a pg-boss schedule: it runs once per occurrence across replicas,
// retries, and stops with the queue.
const noTimers = {
  name: 'setInterval',
  message: 'Periodic work is a schedule: defineSchedule() in apps/api/src/modules/jobs.',
};

export const restrictedRules = {
  'no-restricted-imports': ['error', { paths: [routerBuilder, ...decided] }],
} satisfies OxlintConfig['rules'];

export const restrictedOverrides = [
  {
    files: [
      'packages/contract/**',
      'packages/db/**',
      'packages/plugin-sdk/**',
      'packages/payment-gateways/**',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        { paths: [routerBuilder, ...decided], patterns: [noApps] },
      ],
    },
  },
  {
    // Table definitions ship inside the published contract (noDriver).
    files: ['packages/db/src/schema/**', 'packages/db/src/table.ts', 'packages/db/src/enums.ts'],
    rules: {
      'no-restricted-imports': ['error', { paths: decided, patterns: [noApps, noDriver] }],
    },
  },
  {
    files: ['apps/web/src/**', 'packages/ui/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        { paths: [routerBuilder, ...decided], patterns: [noApps, serverOnly] },
      ],
    },
  },
  {
    // Core's hashing, comparisons and random tokens all go through lib/crypto.ts, its
    // transactions through withOrg/withSystem and savepoint(), its periodic work through
    // pg-boss schedules.
    files: ['apps/api/**'],
    rules: {
      'no-restricted-imports': ['error', { paths: [routerBuilder, ...decided, ...nodeCrypto] }],
      'no-restricted-properties': ['error', oneTransaction],
      'no-restricted-globals': ['error', noTimers],
    },
  },
  {
    // A live stream's heartbeat and member re-check belong to its connection and end with it.
    files: ['apps/api/src/modules/live/stream.http.ts'],
    rules: { 'no-restricted-globals': 'off' },
  },
  {
    files: ['apps/api/src/lib/crypto.ts'],
    rules: { 'no-restricted-imports': ['error', { paths: [routerBuilder, ...decided] }] },
  },
  {
    // The one place that implements the contract; feature routers import its builders.
    files: ['apps/api/src/orpc.ts'],
    rules: { 'no-restricted-imports': ['error', { paths: [...decided, ...nodeCrypto] }] },
  },
  {
    // Test fixtures write through the owner's connection, outside any scope (`.transaction()`).
    files: ['**/__tests__/**', '**/*.test.ts', '**/*.test.tsx'],
    rules: { 'no-restricted-properties': 'off' },
  },
] satisfies OxlintConfig['overrides'];
