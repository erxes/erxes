import path from 'node:path';
import type { NextConfig } from 'next';

const appDir = import.meta.dirname;
const repoRoot = path.join(appDir, '..', '..');

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

const resolveAlias = Object.fromEntries(
  sharedDependencies.map((name) => [
    name,
    `./apps/knowledge-base/node_modules/${name}`,
  ]),
);

const nextConfig: NextConfig = {
  /*
   * `standalone` emits a self-contained server bundle under
   * `.next/standalone`, so the runtime image carries only the traced files
   * instead of a full `node_modules`. Tracing starts at the repository root
   * because the app resolves shared dependencies from there.
   */
  output: 'standalone',
  outputFileTracingRoot: repoRoot,
  experimental: {
    externalDir: true,
  },
  turbopack: {
    root: repoRoot,
    resolveAlias,
  },
};

export default nextConfig;
