// First: tracing patches http, express and pg before they load.
import { stopTracing } from '~/instrumentation';
import { closeDb, configureDb, runMigrations } from '@erxes/core-db';
import { createApp } from '~/app';
import { config } from '~/config';
import { logger } from '~/logger';
import { startMaintenance } from '~/lib/maintenance';
import { loadSigningKeys } from '~/lib/signing';
import { startEventProcessor } from '~/modules/events/processor';
import { liveHub } from '~/modules/live/hub';
import { syncPluginSecrets } from '~/modules/plugins/plugins.service';

const log = logger.child({ component: 'main' });

const start = async () => {
  configureDb({
    ...config.data,
    applicationName: 'erxes-core',
    onError: (error) => log.error({ err: error }, 'idle postgres client error'),
  });

  loadSigningKeys();

  const applied = await runMigrations();

  if (applied.length) {
    log.info({ migrations: applied }, 'applied migrations');
  }

  await syncPluginSecrets();

  const server = createApp().listen(config.port, () => {
    log.info({ port: config.port, tracing: Boolean(config.otel.endpoint) }, 'api ready');
  });

  const stopMaintenance = startMaintenance();
  liveHub.start();

  const stopEvents = startEventProcessor();

  server.keepAliveTimeout = 120_000;
  server.headersTimeout = 121_000;

  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, () => {
      log.info({ signal }, 'shutting down');
      stopMaintenance();
      server.close();
      void Promise.all([stopEvents(), liveHub.stop()])
        .then(() => Promise.all([closeDb(), stopTracing()]))
        .then(() => log.info('stopped'))
        .catch((error: unknown) => {
          log.error({ err: error }, 'shutdown failed');
          process.exitCode = 1;
        })
        .finally(() => process.exit());
    });
  }
};

start().catch((error: unknown) => {
  log.fatal({ err: error }, 'failed to start');
  process.exit(1);
});
