import { Db, newId, organizations, users, withSystem } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { HttpError, notFound, pgCode } from '~/http/errors';
import { installPluginsForNewOrganization } from '~/modules/plugins/plugins.service';
import { seedRoles } from '~/modules/roles/roles.service';

const SUBDOMAIN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export const toOrganizationDto = (row: typeof organizations.$inferSelect) => ({
  id: row.id,
  subdomain: row.subdomain,
  name: row.name,
  createdAt: row.createdAt.toISOString(),
});

export const getOrganization = async (client: Db, orgId: string) => {
  const [row] = await client
    .select()
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  if (!row) {
    throw notFound('Organization');
  }

  return row;
};

interface NewOrganization {
  subdomain: string;
  name: string;
  owner: { email: string; fullName?: string; passwordHash?: string };
}

/** Creates an organisation with its first owner (active) inside `tx`. */
export const insertOrganization = async (tx: Db, input: NewOrganization) => {
  const subdomain = input.subdomain.trim().toLowerCase();

  if (!SUBDOMAIN.test(subdomain)) {
    throw new HttpError(400, 'INVALID_SUBDOMAIN', 'Use letters, digits and dashes (1–63)');
  }

  const [organization] = await tx
    .insert(organizations)
    .values({ id: newId(), subdomain, name: input.name.trim() })
    .returning();
  await seedRoles(tx, organization!.id);

  const [owner] = await tx
    .insert(users)
    .values({
      id: newId(),
      orgId: organization!.id,
      email: input.owner.email.trim().toLowerCase(),
      fullName: input.owner.fullName?.trim() || null,
      passwordHash: input.owner.passwordHash ?? null,
      role: 'owner',
      status: 'active',
    })
    .returning();

  await installPluginsForNewOrganization(tx, organization!.id);

  return { organization: organization!, owner: owner! };
};

/** Creates an organisation with its first owner (bootstrap script, setup, tests). */
export const createOrganization = async (input: NewOrganization) => {
  try {
    return await withSystem('create organization', (tx) => insertOrganization(tx, input));
  } catch (error) {
    if (pgCode(error) === '23505') {
      throw new HttpError(409, 'SUBDOMAIN_TAKEN', 'This subdomain is already used');
    }

    throw error;
  }
};
