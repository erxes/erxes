import { defineConfig, devices } from '@playwright/test';
import { OWNER_STATE } from './fixtures';

// The stack under test: CI's deploy/docker-compose.yml on :8080, or `pnpm dev` on :3500.
const { CI, E2E_BASE_URL } = process.env;

/**
 * Daily flows in Chromium against a running stack on a fresh database. The setup
 * project creates the organisation through the API; every spec reuses its owner session.
 * Each flow runs in the light and the dark theme, so axe checks contrast in both.
 */
export default defineConfig({
  testDir: '.',
  outputDir: 'test-results',
  globalSetup: './globalSetup.ts',
  fullyParallel: true,
  forbidOnly: Boolean(CI),
  workers: CI ? 4 : 2,
  reporter: CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: E2E_BASE_URL ?? 'http://localhost:3500',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: 'owner.setup.ts' },
    ...(['light', 'dark'] as const).map((colorScheme) => ({
      name: colorScheme,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], colorScheme, storageState: OWNER_STATE },
    })),
  ],
});
