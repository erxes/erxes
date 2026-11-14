/**
 * The libraries web shares with plugin UIs as single instances. web's
 * rsbuild.config.ts provides each one; a plugin UI imports this list from
 * `erxes-ui/federation` and declares the same names with `import: false`, so
 * it never bundles a second React, router, query client or erxes-ui. A shared
 * name matches only that exact import, so React's entry points are listed one
 * by one: a remote that bundles its own `react/jsx-runtime` breaks as soon as
 * its React differs from the host's. `@tanstack/query-core` is listed with
 * `@tanstack/react-query` because `@orpc/tanstack-query` imports it directly: a
 * plugin's own copy would hold a different `skipToken`, so `input: skipToken`
 * (from the host's `@tanstack/react-query`) would run the query, not disable it.
 */
export const SHARED = [
  'react',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
  'react-dom',
  'react-dom/client',
  'react-router',
  'react-router-dom',
  'erxes-ui',
  'jotai',
  'react-i18next',
  '@tanstack/react-query',
  '@tanstack/query-core',
];
