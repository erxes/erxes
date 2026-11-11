import { closeDb, configureDb, runMigrations, runtimeRole } from '@erxes/core-db';
import { createApp } from '~/app';
import { config } from '~/config';
import { startMaintenance } from '~/lib/maintenance';
import { loadSigningKeys } from '~/lib/signing';
import { startEventProcessor } from '~/modules/events/processor';
import { liveHub } from '~/modules/live/hub';
import { syncPluginSecrets } from '~/modules/plugins/plugins.service';

const start = async () => {
  configureDb({ ...config.data, applicationName: 'erxes-core' });

  loadSigningKeys();

  // Production migrates with its own command and role (`pnpm db:migrate`);
  // development migrates on start for convenience.
  if (config.data.migrateOnStart) {
    const applied = await runMigrations();

    if (applied.length) {
      console.log(`[core] applied migrations: ${applied.join(', ')}`);
    }
  }

  // Tenant isolation relies on row level security: a role that bypasses it
  // (superuser, BYPASSRLS) turns it off. Refused in production.
  const role = await runtimeRole();

  if (role.bypassesRls) {
    const message = `[core] the database role "${role.name}" bypasses row level security: tenant isolation is off. Use a runtime role (pnpm db:grant -- <role>).`;

    if (config.isProduction) throw new Error(message);

    console.warn(message);
  }

  await syncPluginSecrets();

  const server = createApp().listen(config.port, () => {
    console.log(`[core] api ready at http://localhost:${config.port}`);
  });

  const stopMaintenance = startMaintenance();
  liveHub.start();

  const stopEvents = startEventProcessor();

  server.keepAliveTimeout = 120_000;
  server.headersTimeout = 121_000;

  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, () => {
      stopMaintenance();
      server.close();
      Promise.all([stopEvents(), liveHub.stop()])
        .then(() => closeDb())
        .finally(() => process.exit(0));
    });
  }
};

start().catch((error) => {
  console.error('[core] failed to start', error);
  process.exit(1);
});
