/**
 * Creates an organisation with its first owner and prints an access token,
 * until the sign-in slice exists:
 *   pnpm bootstrap -- --subdomain acme --name "Acme" --email owner@acme.mn --password '…'
 */
import { closeDb, configureDb, runMigrations } from '@erxes/core-db';
import { parseArgs } from 'node:util';
import { config } from '~/config';
import { signAccessToken } from '~/http/auth';
import { logger } from '~/logger';
import { hashPassword } from '~/modules/auth/password';
import { createOrganization } from '~/modules/organizations/organizations.service';

const argv = process.argv.slice(2);

const { values } = parseArgs({
  // `pnpm bootstrap -- …` passes the `--` through, and parseArgs reads
  // everything after a `--` as positionals.
  args: argv[0] === '--' ? argv.slice(1) : argv,
  options: {
    subdomain: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string' },
    'full-name': { type: 'string' },
    password: { type: 'string' },
  },
});

const main = async () => {
  if (!values.subdomain || !values.email) {
    throw new Error(
      'Usage: --subdomain <sub> --email <owner email> [--name <org name>] [--full-name <owner>]',
    );
  }

  configureDb({
    ...config.data,
    onError: (error) => logger.error({ err: error }, 'idle postgres client error'),
  });
  await runMigrations();

  const { organization, owner } = await createOrganization({
    subdomain: values.subdomain,
    name: values.name ?? values.subdomain,
    owner: {
      email: values.email,
      fullName: values['full-name'],
      passwordHash: values.password ? await hashPassword(values.password) : undefined,
    },
  });

  process.stdout.write(
    [
      `organization ${organization.id} (${organization.subdomain})`,
      `owner        ${owner.id} <${owner.email}>`,
      `token        ${signAccessToken(owner.id, organization.id)}`,
      '',
    ].join('\n'),
  );
};

const run = async () => {
  try {
    await main();
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  } finally {
    await closeDb();
  }
};

void run();
