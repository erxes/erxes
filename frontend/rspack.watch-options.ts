import type { Configuration } from '@rspack/core';

export const applyWatchOptions = (config: Configuration): Configuration => {
  config.watchOptions = {
    ...config.watchOptions,
    ignored: [
      '**/node_modules/**',
      '**/.git/**',
      '**/.nx/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.turbo/**',
      '**/.next/**',
    ],
  };

  return config;
};
