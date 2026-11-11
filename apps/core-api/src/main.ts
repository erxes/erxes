import { closeDb, configureDb, runMigrations } from '@erxes/core-db';
import { createApp } from '~/app';
import { config } from '~/config';

const start = async () => {
  configureDb({ ...config.data, applicationName: 'erxes-core' });

  const applied = await runMigrations();

  if (applied.length) {
    console.log(`[core] applied migrations: ${applied.join(', ')}`);
  }

  const server = createApp().listen(config.port, () => {
    console.log(`[core] api ready at http://localhost:${config.port}`);
  });

  server.keepAliveTimeout = 120_000;
  server.headersTimeout = 121_000;

  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, () => {
      server.close();
      closeDb().finally(() => process.exit(0));
    });
  }
};

start().catch((error) => {
  console.error('[core] failed to start', error);
  process.exit(1);
});
