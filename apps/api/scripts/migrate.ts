/**
 * Applies core's migrations as the owner role (DATA_MIGRATION_URL, else
 * DATA_URL), then grants the runtime role what it needs when DATA_RUNTIME_ROLE
 * is set:  pnpm db:migrate
 */
import { migrateAsOwner } from '~/lib/migrateDb';
import { runCli, say } from './cli';

const main = async () => {
  const { applied, granted } = await migrateAsOwner('erxes-core-migrate');

  say(applied.length ? `applied: ${applied.join(', ')}` : 'up to date');

  if (granted) say(`granted ${granted} access to core's tables`);
};

runCli(main);
