export const quietDevLogs = (config: any) => {
  const existingIgnored = config.watchOptions?.ignored;
  const ignored = Array.isArray(existingIgnored)
    ? existingIgnored
    : existingIgnored
      ? [existingIgnored]
      : [];

  config.watchOptions = {
    ...(config.watchOptions || {}),
    // Batch rapid file changes such as git branch switches into fewer rebuilds.
    aggregateTimeout: config.watchOptions?.aggregateTimeout ?? 800,
    ignored: [...ignored, '**/dist/**', '**/.git/**', '**/coverage/**'],
  };

  return config;
};
