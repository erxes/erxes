import { type Db, integrationConnections } from '@erxes/core-db';
import { and, eq, ne, sql } from 'drizzle-orm';

import { fail } from '~/http/errors';

/**
 * Refuses `name` when another connection of the integration has it, before the
 * keys go to the service. The unique index stays the guarantee.
 */
export const ensureNameFree = async (
  tx: Db,
  integration: { key: string; name: string },
  name: string,
  connectionId?: string,
) => {
  const [taken] = await tx
    .select({ id: integrationConnections.id })
    .from(integrationConnections)
    .where(
      and(
        eq(integrationConnections.key, integration.key),
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
