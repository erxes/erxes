import { cpSync } from 'node:fs';
import { defineConfig } from 'tsup';

// One CommonJS bundle; workspace packages are inlined, npm packages stay external.
export default defineConfig({
  entry: ['src/main.ts'],
  format: ['cjs'],
  platform: 'node',
  target: 'node22',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  noExternal: [/^@erxes\/core-/],
  // The bundle applies core's migrations at startup: ship them next to it.
  onSuccess: async () => {
    cpSync('../../packages/db/drizzle', 'dist/drizzle', { recursive: true });
  },
});
