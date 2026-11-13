// The `no-restricted-imports` and `no-restricted-properties` entries vite.config.ts gives each
// part of the repo.

// Procedures are built from the contract in one place, so every route goes
// through the same context and access checks.
export const routerBuilder = {
  name: '@orpc/server',
  importNames: ['implement', 'os'],
  message:
    'Build procedures with the builders from apps/core-api/src/orpc.ts, in modules/<feature>/<feature>.router.ts.',
};

// Decisions recorded as bans: each message says what to use instead.
export const decided = [
  {
    name: 'graphile-worker',
    message: 'Durable work goes through core_jobs (apps/core-api/src/modules/jobs).',
  },
  {
    name: 'bullmq',
    message: 'Durable work goes through core_jobs (apps/core-api/src/modules/jobs).',
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
export const nodeCrypto = ['node:crypto', 'crypto'].map((name) => ({
  name,
  message:
    'Use apps/core-api/src/lib/crypto.ts (safeEqual, sha256, hmacSha256, randomToken), or add the helper there.',
}));

// Packages are shared with plugins and never reach into an app.
export const noApps = {
  group: [
    '@erxes/core-api',
    '@erxes/core-api/*',
    '@erxes/core-ui',
    '@erxes/core-ui/*',
    '**/apps/**',
  ],
  message: 'Packages and the UI never import an app. Move the shared code into a package.',
};

// Browser code runs without Node and without the database.
export const serverOnly = {
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
// column builders, `../table`, `../enums` and nothing that needs Node or a database.
export const noDriver = {
  group: ['pg', 'pg/*', 'node:*', 'drizzle-orm/node-postgres', '../*', '!../table', '!../enums'],
  message: 'Table definitions ship inside the published contract: no Node, driver or client.',
};

// A request or job already runs in one transaction (withOrg / withSystem), so a nested
// `.transaction()` only adds a savepoint, and that has one name.
export const oneTransaction = {
  property: 'transaction',
  message:
    "The request's withOrg/withSystem scope is already one transaction. To undo only part of it when you catch its error, use savepoint() from @erxes/core-db.",
};
