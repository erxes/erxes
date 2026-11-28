// Already loaded by `node --import` (see the file), which is what lets it patch http, express and pg.
import { stopTracing } from '~/instrumentation';
import { blockedIndexFunctions, closeDb, configureDb, runtimeRole } from '@erxes/core-db';
import { createApp } from '~/app';
import { config } from '~/config';
import { startDraining } from '~/lib/lifecycle';
import { migrateAsOwner } from '~/lib/migrateDb';
import { loadSigningKeys } from '~/lib/signing';
import { closeAgents } from '~/modules/agents/host';
import { recoverAgents } from '~/modules/agents/recovery';
import { startJobs, stopJobs } from '~/modules/jobs/jobs';
import { JOBS } from '~/modules/jobs/registry';
import { fetchLicense } from '~/modules/license/activation';
import { liveHub } from '~/modules/live/hub';
import { syncPluginSecrets } from '~/modules/plugins/plugins.service';
import { logger } from '~/logger';

const log = logger.child({ component: 'main' });

const start = async () => {
  loadSigningKeys();

  // Production migrates with its own command and role (`pnpm db:migrate`);
  // development migrates on start for convenience, the same way.
  if (config.data.migrateOnStart) {
    const { applied } = await migrateAsOwner('erxes-core-migrate');

    if (applied.length) {
      log.info({ migrations: applied }, 'applied migrations');
    }
  }

  configureDb({
    ...config.data,
    applicationName: 'erxes-core',
    onIdleError: (error) => log.warn({ err: error }, 'idle database connection failed'),
  });

  // Tenant isolation relies on row level security: a role that bypasses it
  // (superuser, BYPASSRLS) turns it off. Refused in production.
  const role = await runtimeRole();

  if (role.bypassesRls) {
    const message = `the database role "${role.name}" bypasses row level security: tenant isolation is off. Use a runtime role (pnpm db:grant <role>).`;

    if (config.isProduction) throw new Error(message);

    log.warn(message);
  }

  const blocked = role.bypassesRls ? [] : await blockedIndexFunctions();

  if (blocked.length) {
    log.warn(
      { functions: blocked },
      'search, "contains" filters and email lookups read every row: row level security keeps these functions off their indexes until a superuser runs pnpm db:migrate, which marks them LEAKPROOF',
    );
  }

  await syncPluginSecrets();
  await startJobs(JOBS, { work: true });

  // A new activation key takes effect now, not at the next daily fetch. It waits on erxes.io, so the
  // API starts without it; a failure keeps the last license and says why in Settings › License.
  fetchLicense().catch((error: unknown) => {
    log.error({ err: error }, 'could not store the erxes license');
  });

  const server = createApp().listen(config.port, () => {
    log.info({ port: config.port, tracing: Boolean(config.otel.endpoint) }, 'api ready');
  });

  liveHub.start();

  // createApp registered the agents: what this server ran before a restart goes on now.
  recoverAgents().catch((error: unknown) => {
    log.error({ err: error }, 'could not resume unfinished agent runs');
  });

  server.keepAliveTimeout = 120_000;
  server.headersTimeout = 121_000;

  /**
   * Graceful shutdown: fail readiness, stop taking connections, end live
   * streams (browsers reconnect to another server), let requests in flight
   * finish (up to 15 s), let jobs in progress finish (up to 30 s), then close
   * the pools.
   */
  const shutdown = (signal: string) => {
    log.info({ signal }, 'shutting down');
    startDraining();
    liveHub.emit('closing');

    const forced = setTimeout(() => {
      log.warn('requests still running after 15 s: closing anyway');
      server.closeAllConnections();
    }, 15_000);

    forced.unref();
    server.close(() => {
      Promise.all([stopJobs(), closeAgents(), liveHub.stop()])
        .then(() => Promise.all([closeDb(), stopTracing()]))
        .then(() => log.info('stopped'))
        .catch((error: unknown) => {
          log.error({ err: error }, 'shutdown failed');
          process.exitCode = 1;
        })
        .finally(() => process.exit());
    });
    server.closeIdleConnections();
  };

  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, () => shutdown(signal));
  }
};

start().catch((error: unknown) => {
  log.fatal({ err: error }, 'failed to start');
  process.exit(1);
});
