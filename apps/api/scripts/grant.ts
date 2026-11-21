/**
 * Creates (if missing) and grants the API's runtime role: data access to
 * core's tables, no DDL, no BYPASSRLS. Run as the owner:
 *   pnpm db:grant erxes_app            (then set its password and use it in DATA_URL)
 */
import { parseArgs } from 'node:util';
import { connectAsOwner, grantRuntime } from '~/lib/migrate';
import { runCli, say } from './cli';

const [role] = parseArgs({ allowPositionals: true }).positionals;

const main = async () => {
  if (!role) throw new Error('Usage: pnpm db:grant <role name>');

  connectAsOwner();
  await grantRuntime(role);
  say(
    `${role}: data access granted. Set a password (ALTER ROLE ${role} PASSWORD '…') and use it in DATA_URL;`,
  );
  say('keep the owner in DATA_MIGRATION_URL for pnpm db:migrate.');
};

runCli(main);
