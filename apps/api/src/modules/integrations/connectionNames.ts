import { type Db, integrationConnections } from '@erxes/core-db';
import { and, eq, isNull, ne, sql } from 'drizzle-orm';

import { fail } from '~/http/errors';

/** The connections that share names with one of `ownerId`: the organisation's, or the member's. */
export const sameOwner = (ownerId: string | null) =>
  ownerId === null
    ? isNull(integrationConnections.ownerId)
    : eq(integrationConnections.ownerId, ownerId);

/**
 * Refuses `name` when another connection of the integration with the same owner has it, before
 * the keys go to the service. The unique index stays the guarantee.
 */
export const ensureNameFree = async (
  tx: Db,
  integration: { key: string; name: string },
  ownerId: string | null,
  name: string,
  connectionId?: string,
) => {
  const [taken] = await tx
    .select({ id: integrationConnections.id })
    .from(integrationConnections)
    .where(
      and(
        eq(integrationConnections.key, integration.key),
        sameOwner(ownerId),
        sql`lower(${integrationConnections.name}) = lower(${name})`,
        connectionId ? ne(integrationConnections.id, connectionId) : undefined,
      ),
    )
    .limit(1);

  if (taken) {
    throw fail('TAKEN', `Another ${integration.name} connection is named “${name}”`, {
      field: 'name',
    });
  }
};
