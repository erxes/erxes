import { config } from '#/config.ts';
import { core, manifest } from '#/core.ts';
import { pool } from '#/db/client.ts';
import { runMigrations } from '#/db/migrate.ts';
import { logger } from '#/logger.ts';
import { createApp } from '#/server.ts';

const applied = await runMigrations();

if (applied.length) logger.info({ applied }, 'applied migrations');

// Core installs it automatically in development and self-hosted (PLUGINS_AUTO_INSTALL).
await core.registerManifest(manifest);

const server = createApp().listen(config.port, () => {
  logger.info(`API on ${config.publicUrl}, UI entry ${manifest.ui.entry}`);
});

const stop = () => server.close(() => void pool.end());

process.once('SIGTERM', stop);

process.once('SIGINT', stop);
