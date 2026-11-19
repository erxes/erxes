import { defineConfig } from 'tsdown';

// The publishable build: one ES module per source file, so each domain is also a
// subpath (`@erxes/core-contract/events`). The workspace imports the sources: tsdown
// writes `exports` pointing at src/ and puts the dist ones in `publishConfig`.
//
// The schemas build on the Drizzle tables in the private `@erxes/core-db`, so the
// build copies those table modules into dist, code and types. A plugin installs
// only this package, never `@erxes/core-db`. `onlyImport` fails the build when
// dist imports anything outside `dependencies`.
//
// The assistant's watch events are pi-durable's view and Chord's ops. The contract
// imports only their types, so both are optional peers: a plugin that never watches
// the assistant doesn't install pi, and sees those two types as `any`.
export default defineConfig({
  entry: ['src/*.ts'],
  platform: 'neutral',
  unbundle: true,
  dts: true,
  deps: {
    alwaysBundle: [/^@erxes\/core-db(\/|$)/],
    onlyImport: [
      '@earendil-works/chord',
      '@earendil-works/pi-durable',
      '@orpc/client',
      '@orpc/contract',
      '@orpc/openapi-client',
      '@orpc/tanstack-query',
      'country-to-currency',
      'dataloader',
      'drizzle-orm',
      'drizzle-zod',
      'zod',
    ],
    dts: { alwaysBundle: [/^@erxes\/core-db(\/|$)/] },
  },
  exports: { devExports: true },
  publint: true,
  attw: { profile: 'esm-only', level: 'error' },
});
