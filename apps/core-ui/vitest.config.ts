import { resolve } from 'node:path';
import { defineConfig } from 'vite-plus';

export default defineConfig({
  resolve: { alias: { '~': resolve(__dirname, 'src') } },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
