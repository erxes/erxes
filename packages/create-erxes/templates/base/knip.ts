import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  workspaces: {
    '.': {
      entry: ['{tools,migration,scripts}/*.ts'],
      project: ['*.ts', '{tools,migration,scripts}/**/*.ts'],
      // The check task runs these: oxlint calls tsrs-lint through OXLINT_TSGOLINT_PATH, and
      // react-doctor reads doctor.config.jsonc.
      ignoreDependencies: ['tsrs', 'react-doctor'],
    },
    api: {
      project: ['src/**/*.ts'],
    },
    ui: {
      entry: ['src/config.tsx', 'src/__Pascal__.tsx'],
      project: ['src/**/*.{ts,tsx,css}'],
    },
  },
};

export default config;
