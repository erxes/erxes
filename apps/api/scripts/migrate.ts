/**
 * Applies core's migrations as the owner role (DATA_MIGRATION_URL, else
 * DATA_URL), then grants the runtime role what it needs when DATA_RUNTIME_ROLE
 * is set:  pnpm db:migrate
 */
import { config } from '~/config';
import { migrate } from '~/lib/migrate';
import { runCli, say } from './cli';

const main = async () => {
  const applied = await migrate();

  say(applied.length ? `applied: ${applied.join(', ')}` : 'up to date');

  if (config.data.runtimeRole) say(`granted ${config.data.runtimeRole} access to core's tables`);
};

runCli(main);
