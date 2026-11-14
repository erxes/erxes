/**
 * Registers a plugin (if new) and gives it a new client secret, printed once.
 * The previous secret keeps working for 24 hours, so a running plugin can be
 * redeployed with the new one without downtime:
 *   pnpm plugin:secret hr
 */
import { configureDb, runMigrations } from '@erxes/core-db';
import { parseArgs } from 'node:util';
import { config } from '~/config';
import { runCli, say } from './cli';
import { rotatePluginSecret } from '~/modules/plugins/plugins.service';

const [name] = parseArgs({ allowPositionals: true }).positionals;

const main = async () => {
  if (!name || !/^[a-z][a-z0-9_]{0,39}$/.test(name) || name === 'core') {
    throw new Error('Usage: pnpm plugin:secret <plugin name>');
  }

  configureDb(config.data);
  await runMigrations();

  const secret = await rotatePluginSecret(name);

  say(
    `Client secret for ${name} (shown once; the previous one works 24 more hours):\n\n  ${secret}\n`,
  );
  say(
    `The plugin exchanges it for tokens: POST /core/v1/plugins/token { grant_type: "client_credentials", client_id: "${name}", client_secret, org }`,
  );
};

runCli(main);
