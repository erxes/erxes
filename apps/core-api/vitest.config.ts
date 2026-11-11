import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { alias: { '~': resolve(__dirname, 'src') } },
  test: {
    // Each test file gets its own throwaway database (src/__tests__/db.ts).
    fileParallelism: false,
    env: {
      // A plugin key for the plugin-only endpoints (notifications, activities).
      CORE_PLUGIN_KEYS: 'hr:test-hr-plugin-key-0123456789abcdefghijklmnop',
      FILES_STORAGE: 'local',
      FILES_LOCAL_DIR: resolve(__dirname, '.test-files'),
      FILES_MAX_SIZE_MB: '5',
    },
    // Generous: tests may run against a remote Postgres (each query is a round trip).
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});
