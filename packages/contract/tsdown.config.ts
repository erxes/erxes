import { defineConfig } from 'tsdown';

// The publishable build: one ES module per source file, so each domain is also a
// subpath (`@erxes/core-contract/events`). The workspace imports the sources: tsdown
// writes `exports` pointing at src/ and puts the dist ones in `publishConfig`.
//
// The schemas build on the Drizzle tables in the private `@erxes/core-db`, so the
// build copies those table modules into dist, code and types. A plugin installs
// only this package, never `@erxes/core-db`. `onlyImport` fails the build when
// dist imports anything outside `dependencies`.
export default defineConfig({
  entry: ['src/*.ts'],
  platform: 'neutral',
  unbundle: true,
  dts: true,
  deps: {
    alwaysBundle: [/^@erxes\/core-db(\/|$)/],
    onlyImport: [
      '@orpc/client',
      '@orpc/contract',
      '@orpc/openapi-client',
      '@orpc/tanstack-query',
      'country-to-currency',
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
