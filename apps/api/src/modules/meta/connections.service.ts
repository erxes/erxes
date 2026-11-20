import type { MetaKind } from '@erxes/core-contract';
import { type Db, metaConnections, runAs, system, withOrg } from '@erxes/core-db';
import { and, asc, eq, sql } from 'drizzle-orm';
import { notFound } from '~/http/errors';
import { wholeList } from '~/lib/keyset';
import { unseal } from '~/lib/secrets';
import { logger } from '~/logger';
import { notify } from '~/modules/notifications/notifications.service';
import { graph, MetaRefused } from './graph';
import { routeThroughRelay } from './relay';

const log = logger.child({ component: 'meta' });

const PAGE_FIELDS = [
  'conversations',
  'feed',
  'message_deliveries',
  'message_echoes',
  'message_reactions',
  'message_reads',
  'messages',
  'messaging_handovers',
  'messaging_postbacks',
  'messaging_referrals',
  'standby',
];

export type ConnectionRow = typeof metaConnections.$inferSelect;

export const listConnections = (client: Db, kind?: MetaKind) =>
  wholeList((limit) =>
    client
      .select()
      .from(metaConnections)
      .where(kind ? eq(metaConnections.kind, kind) : undefined)
      .orderBy(asc(metaConnections.kind), asc(metaConnections.name), asc(metaConnections.id))
      .limit(limit),
  );

export const findConnection = async (client: Db, id: string, kind?: MetaKind) => {
  const [row] = await client
    .select()
    .from(metaConnections)
    .where(and(eq(metaConnections.id, id), kind ? eq(metaConnections.kind, kind) : undefined))
    .limit(1);

  if (!row) throw notFound(kind === 'instagram' ? 'Instagram account' : 'Connection');

  return row;
};

export const tokenOf = (row: ConnectionRow) => unseal(row.tokenSealed);

export const openConnection = async (orgId: string, id: string, kind?: MetaKind) => {
  const row = await withOrg(orgId, (tx) => findConnection(tx, id, kind));

  return { row, token: tokenOf(row) };
};

export const subscribeToPage = (pageId: string, token: string) =>
  graph(`${pageId}/subscribed_apps`, token, {
    method: 'POST',
    query: { subscribed_fields: PAGE_FIELDS.join(',') },
  });

const recordCheck = async (orgId: string, id: string, error: string | null) => {
  const { checked, broke } = await withOrg(orgId, async (tx) => {
    const [locked] = await tx
      .select({ status: metaConnections.status })
      .from(metaConnections)
      .where(eq(metaConnections.id, id))
      .for('update');

    const [updated] = await tx
      .update(metaConnections)
      .set({
        status: error ? 'broken' : 'healthy',
        statusReason: error,
        checkedAt: sql`now()`,
        updatedAt: sql`now()`,
      })
      .where(eq(metaConnections.id, id))
      .returning();

    if (!updated) throw notFound('Connection');

    const newlyBroken = Boolean(error) && locked?.status === 'healthy';

    if (newlyBroken && updated.connectedBy)
      await runAs(system('meta connection broken'), () =>
        notify(tx, {
          userIds: [updated.connectedBy ?? ''],
          kind: 'core.integration.broken',
          title: 'A Meta connection stopped working',
          body: `${updated.name}: ${error ?? ''}`.slice(0, 2000),
          link: '/settings/integrations/meta',
        }),
      );

    return { checked: updated, broke: newlyBroken };
  });

  if (broke) log.warn({ orgId, connectionId: id, reason: error }, 'Meta connection broke');

  return checked;
};

export const markRefused = async (orgId: string, id: string, error: unknown) => {
  if (!(error instanceof MetaRefused) || !error.tokenRefused) return;

  await recordCheck(orgId, id, error.message).catch((failure: unknown) => {
    log.error({ err: failure, orgId, connectionId: id }, 'refused connection not marked broken');
  });
};

const problemOf = (error: unknown) => (error instanceof Error ? error.message : String(error));

const routeAgain = (row: ConnectionRow, daily: boolean) => {
  if (row.app !== 'install') return undefined;

  const routed = routeThroughRelay(row.kind, row.externalId);

  return daily
    ? routed.catch((error: unknown) => {
        log.warn(
          { err: error, orgId: row.orgId, connectionId: row.id },
          'Meta relay route not restored',
        );
      })
    : routed;
};

export const repairConnection = async (orgId: string, id: string, { daily = false } = {}) => {
  const { row, token } = await openConnection(orgId, id);

  const error = await (async () => {
    await Promise.all([subscribeToPage(row.pageId, token), routeAgain(row, daily)]);
    await graph('me', token, { query: { fields: 'id' } });

    return null;
  })().catch(problemOf);

  return recordCheck(orgId, id, error);
};

export const removeConnection = async (client: Db, id: string) => {
  const row = await findConnection(client, id);

  await client.delete(metaConnections).where(eq(metaConnections.id, id));

  return row;
};
