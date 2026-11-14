import type { SaasWorkspace } from '@erxes/core-contract';
import {
  entitlements,
  organizations,
  pluginInstallations,
  type Transaction,
  users,
  withOrg,
  withSystem,
} from '@erxes/core-db';
import { and, eq, ne, sql } from 'drizzle-orm';
import { config } from '~/config';
import { HttpError, pgCode } from '~/http/errors';
import { safeEqual } from '~/lib/crypto';
import { insertOrganization } from '~/modules/organizations/organizations.service';
import { forgetEntitlements, refreshEntitlements } from './entitlements';

/** `Authorization: Bearer <SAAS_PLATFORM_TOKEN>`: erxes.io calling core. */
export const platformAuthorized = (header: string | undefined) => {
  const token = config.saas.platformToken;
  const given = header?.startsWith('Bearer ') ? header.slice(7) : '';

  if (!token || !given) return false;

  return safeEqual(token, given);
};

/** Creates the organisation and its owner, or renames it; a taken subdomain is a 409. */
const upsertOrganization = async (tx: Transaction, orgId: string, input: SaasWorkspace) => {
  const [org] = await tx
    .select()
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .for('update')
    .limit(1);

  const { subdomain, name, country, currency } = input.organization;

  try {
    if (!org) {
      if (!input.owner)
        throw new HttpError(400, 'OWNER_REQUIRED', 'A new workspace needs its owner');

      await insertOrganization(tx, {
        id: orgId,
        subdomain,
        name,
        country,
        currency,
        owner: input.owner,
      });
    } else if (org.subdomain !== subdomain || org.name !== name) {
      // Country and currency are the organisation's own settings after it is made.
      await tx
        .update(organizations)
        .set({ subdomain, name, updatedAt: sql`now()` })
        .where(eq(organizations.id, orgId));
    }
  } catch (error) {
    if (pgCode(error) === '23505')
      throw new HttpError(409, 'SUBDOMAIN_TAKEN', 'Another workspace has this subdomain');
    throw error;
  }

  return !org;
};

/** Creates the workspace (organisation and owner) the first time; renames, enables or disables it after. Then reads its plugins. */
export const applyWorkspace = async (orgId: string, input: SaasWorkspace) => {
  const created = await withSystem('saas: workspace', async (tx) => {
    const isNew = await upsertOrganization(tx, orgId, input);

    if (input.status) {
      await tx
        .insert(entitlements)
        .values({ orgId, orgStatus: input.status, fetchedAt: new Date(0) })
        .onConflictDoUpdate({ target: entitlements.orgId, set: { orgStatus: input.status } });
    }

    return isNew;
  });

  forgetEntitlements(orgId);

  const row = await refreshEntitlements(orgId);

  return {
    created,
    organizationStatus: row?.orgStatus ?? input.status ?? 'active',
    plugins: row?.plugins ?? [],
  };
};

/** What erxes.io may read back: the workspace and its usage. */
export const workspaceUsage = (orgId: string) =>
  withOrg(orgId, async (tx) => {
    const [org] = await tx.select().from(organizations).limit(1);

    if (!org) throw new HttpError(404, 'NOT_FOUND', 'No such workspace');

    const [row] = await tx.select().from(entitlements).limit(1);

    const [{ members } = { members: 0 }] = await tx
      .select({ members: sql<number>`count(*)::int` })
      .from(users)
      .where(and(ne(users.status, 'disabled'), eq(users.isSupport, false)));

    const installed = await tx
      .select({
        plugin: pluginInstallations.plugin,
        status: pluginInstallations.status,
        statusReason: pluginInstallations.statusReason,
      })
      .from(pluginInstallations);

    return {
      id: org.id,
      subdomain: org.subdomain,
      name: org.name,
      organizationStatus: row?.orgStatus ?? 'active',
      checkedAt: row && row.fetchedAt.getTime() > 0 ? row.fetchedAt.toISOString() : null,
      usage: { teamMembers: members },
      plugins: installed,
    };
  });
