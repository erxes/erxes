import path from 'node:path';
import type { NextConfig } from 'next';

const appDir = import.meta.dirname;

/**
 * `erxes-ui` components are compiled from source in `frontend/libs/erxes-ui`,
 * which lives outside this app. Their own imports would otherwise resolve
 * against the monorepo's root `node_modules` (React 18), so the packages both
 * sides share are pinned to this app's copies.
 */
const sharedDependencies = [
  'react',
  'react-dom',
  'react-hook-form',
  'radix-ui',
  'class-variance-authority',
  'clsx',
  'tailwind-merge',
  'type-fest',
  'react-imask',
];

/* Turbopack resolves alias targets from `turbopack.root`, not the filesystem. */
const resolveAlias = Object.fromEntries(
  sharedDependencies.map((name) => [
    name,
    `./apps/knowledge-base/node_modules/${name}`,
  ]),
);

const nextConfig: NextConfig = {
  experimental: {
    externalDir: true,
  },
  turbopack: {
    root: path.join(appDir, '..', '..'),
    resolveAlias,
  },
};

export default nextConfig;
