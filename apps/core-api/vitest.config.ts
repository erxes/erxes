import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { alias: { '~': resolve(__dirname, 'src') } },
  test: {
    // Each test file gets its own throwaway database (src/__tests__/db.ts).
    fileParallelism: false,
    testTimeout: 20_000,
    hookTimeout: 60_000,
  },
});
