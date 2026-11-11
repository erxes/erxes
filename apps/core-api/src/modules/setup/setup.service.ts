import { recordAudit } from '~/modules/audit/audit.service';
import { type Db, organizations, withTransaction } from '@erxes/core-db';
import { sql } from 'drizzle-orm';
import { config } from '~/config';
import { HttpError } from '~/http/errors';
import { hashPassword } from '~/modules/auth/password';
import { insertOrganization } from '~/modules/organizations/organizations.service';

const hasOrganization = async (client: Db) => {
  const [row] = await client.select({ id: organizations.id }).from(organizations).limit(1);

  return Boolean(row);
};

/** A subdomain from the organisation name (`Acme LLC` → `acme-llc`), `default` when nothing is left. */
export const subdomainFromName = (name: string) =>
  name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63)
    .replace(/-+$/g, '') || 'default';

export const setupRequired = async (client: Db) => config.setup.enabled && !(await hasOrganization(client));

/**
 * First run: creates the organisation and its owner. Only while the database
 * has no organisation; a lock makes two simultaneous requests safe.
 */
export const runSetup = async (input: {
  organizationName: string;
  subdomain?: string;
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
}) => {
  if (!config.setup.enabled) {
    throw new HttpError(403, 'SETUP_DISABLED', 'Organisations are created by the erxes SaaS service here');
  }

  const passwordHash = await hashPassword(input.password);

  return withTransaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext('core:setup'))`);

    if (await hasOrganization(tx)) {
      throw new HttpError(409, 'SETUP_DONE', 'This installation is already set up. Sign in instead.');
    }

    const created = await insertOrganization(tx, {
      name: input.organizationName,
      subdomain: input.subdomain || subdomainFromName(input.organizationName),
      owner: {
        email: input.email,
        fullName: [input.firstName, input.lastName].filter(Boolean).join(' '),
        passwordHash,
      },
    });

    await recordAudit(
      tx,
      { orgId: created.organization.id, actorType: 'user', actorId: created.owner.id, source: 'core' },
      {
        action: 'organization.created',
        targetType: 'organization',
        targetId: created.organization.id,
        targetLabel: created.organization.name,
      },
    );

    return created;
  });
};
