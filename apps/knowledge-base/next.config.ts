import path from 'node:path';
import type { NextConfig } from 'next';

const appDir = import.meta.dirname;

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
  experimental: {
    externalDir: true,
  },
  turbopack: {
    root: path.join(appDir, '..', '..'),
    resolveAlias,
  },
};

export default nextConfig;
