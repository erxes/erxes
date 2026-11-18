import { config } from '#/config.ts';
import { core, manifest } from '#/core.ts';
import { pool } from '#/db/client.ts';
import { runMigrations } from '#/db/migrate.ts';
import { logger } from '#/logger.ts';
import { createApp } from '#/server.ts';

/** Core installs it automatically in development and self-hosted (PLUGINS_AUTO_INSTALL). */
const register = async () => {
  try {
    return await core.registerManifest(manifest);
  } catch (error) {
    throw new Error(
      `core at ${config.coreUrl} did not take the manifest: check CORE_URL and PLUGIN_SECRET, and that core is up`,
      { cause: error },
    );
  }
};

const start = async () => {
  const applied = await runMigrations();

  if (applied.length) logger.info({ applied }, 'applied migrations');

  const { warnings } = await register();

  for (const warning of warnings) logger.warn({ warning }, 'manifest');

  const server = createApp().listen(config.port, () => {
    logger.info(`API on ${config.publicUrl}, UI entry ${manifest.ui.entry}`);
  });

  const stop = () => server.close(() => void pool.end());

  process.once('SIGTERM', stop);

  process.once('SIGINT', stop);
};

// Like core: a failed start logs why and exits, and the container restarts it.
start().catch((error: unknown) => {
  logger.fatal({ err: error }, 'failed to start');
  process.exit(1);
});
