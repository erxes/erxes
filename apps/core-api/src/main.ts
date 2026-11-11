import { closeDb, configureDb, runMigrations, runtimeRole } from '@erxes/core-db';
import { createApp } from '~/app';
import { config } from '~/config';
import { startMaintenance } from '~/lib/maintenance';
import { startDraining } from '~/lib/lifecycle';
import { loadSigningKeys } from '~/lib/signing';
import { startEventProcessor } from '~/modules/events/processor';
import { liveHub } from '~/modules/live/hub';
import { syncPluginSecrets } from '~/modules/plugins/plugins.service';
import { log } from '~/lib/log';

const start = async () => {
  configureDb({ ...config.data, applicationName: 'erxes-core' });

  loadSigningKeys();

  // Production migrates with its own command and role (`pnpm db:migrate`);
  // development migrates on start for convenience.
  if (config.data.migrateOnStart) {
    const applied = await runMigrations();

    if (applied.length) {
      log.info(`applied migrations: ${applied.join(', ')}`);
    }
  }

  // Tenant isolation relies on row level security: a role that bypasses it
  // (superuser, BYPASSRLS) turns it off. Refused in production.
  const role = await runtimeRole();

  if (role.bypassesRls) {
    const message = `the database role "${role.name}" bypasses row level security: tenant isolation is off. Use a runtime role (pnpm db:grant -- <role>).`;

    if (config.isProduction) throw new Error(message);

    log.warn(message);
  }

  await syncPluginSecrets();

  const server = createApp().listen(config.port, () => {
    log.info(`api ready at http://localhost:${config.port}`);
  });

  const stopMaintenance = startMaintenance();
  liveHub.start();

  const stopEvents = startEventProcessor();

  server.keepAliveTimeout = 120_000;
  server.headersTimeout = 121_000;

  /**
   * Graceful shutdown: fail readiness, stop taking connections, end live
   * streams (browsers reconnect to another server), let requests in flight
   * finish (up to 15 s), stop jobs after their current run, then close the pool.
   */
  const shutdown = (signal: string) => {
    log.info('shutting down', { signal });
    startDraining();
    stopMaintenance();
    liveHub.emit('closing');

    const forced = setTimeout(() => {
      log.warn('requests still running after 15 s: closing anyway');
      server.closeAllConnections();
    }, 15_000);

    forced.unref();
    server.close(() => {
      Promise.all([stopEvents(), liveHub.stop()])
        .then(() => closeDb())
        .catch((error: unknown) => log.error('shutdown failed', { error }))
        .finally(() => process.exit(0));
    });
    server.closeIdleConnections();
  };

  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, () => shutdown(signal));
  }
};

start().catch((error) => {
  log.error('failed to start', { error });
  process.exit(1);
});
