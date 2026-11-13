/**
 * Creates an organisation with its first owner and prints an access token,
 * until the sign-in slice exists:
 *   pnpm bootstrap --subdomain acme --name "Acme" --email owner@acme.mn --password '…'
 */
import { configureDb, runMigrations } from '@erxes/core-db';
import { parseArgs } from 'node:util';
import { config } from '~/config';
import { runCli, say } from './cli';
import { signAccessToken } from '~/http/auth';
import { hashPassword } from '~/modules/auth/password';
import { createOrganization } from '~/modules/organizations/organizations.service';

const { values } = parseArgs({
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

  configureDb(config.data);
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

  say(`organization ${organization.id} (${organization.subdomain})`);
  say(`owner        ${owner.id} <${owner.email}>`);
  say(`token        ${await signAccessToken(owner.id, organization.id)}`);
};

runCli(main);
