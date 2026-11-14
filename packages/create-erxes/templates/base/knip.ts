import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  workspaces: {
    '.': {
      entry: ['{tools,migration,scripts}/*.ts'],
      project: ['*.ts', '{tools,migration,scripts}/**/*.ts'],
      // Oxlint runs tsrs-lint through OXLINT_TSGOLINT_PATH in the check task.
      ignoreDependencies: ['tsrs'],
    },
    api: {
      entry: ['scripts/*.ts'],
      project: ['src/**/*.ts', 'scripts/**/*.ts'],
    },
    ui: {
      entry: ['src/config.tsx', 'src/__Pascal__.tsx'],
      project: ['src/**/*.{ts,tsx}'],
    },
  },
};

export default config;
