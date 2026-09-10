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
    `./apps/help-center/node_modules/${name}`,
  ]),
);

const nextConfig: NextConfig = {
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
