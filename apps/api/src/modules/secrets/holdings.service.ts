import {
  assistantConnections,
  auditStreams,
  type Db,
  emailSettings,
  fileBuckets,
  users,
  webhooks,
} from '@erxes/core-db';
import type { VAULT_HOLDERS } from '@erxes/core-db/enums';
import { sql } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';

type Holder = (typeof VAULT_HOLDERS)[number];

const FEATURES: { holder: Holder; table: PgTable; ids: PgColumn[] }[] = [
  { holder: 'email', table: emailSettings, ids: [emailSettings.secretId] },
  { holder: 'file-bucket', table: fileBuckets, ids: [fileBuckets.secretId] },
  { holder: 'webhook', table: webhooks, ids: [webhooks.secretId] },
  { holder: 'assistant', table: assistantConnections, ids: [assistantConnections.keySecretId] },
  {
    holder: 'audit-stream',
    table: auditStreams,
    ids: [auditStreams.secretId, auditStreams.authHeaderSecretId],
  },
  { holder: 'two-step', table: users, ids: [users.totpSecretId, users.totpPendingSecretId] },
];

const held = (client: Db, table: PgTable, ids: PgColumn[]) =>
  sql<number>`(${client
    .select({
      count: sql`${sql.join(
        ids.map((id) => sql`count(${id})`),
        sql` + `,
      )}`,
    })
    .from(table)})`.mapWith(Number);

export const listHoldings = async (client: Db) => {
  const [counts] = await client
    .select(
      Object.fromEntries(
        FEATURES.map(({ holder, table, ids }) => [holder, held(client, table, ids)]),
      ),
    )
    .from(sql`(select 1) as one`);

  return {
    data: FEATURES.map(({ holder }) => ({ holder, count: counts?.[holder] ?? 0 })).filter(
      ({ count }) => count > 0,
    ),
  };
};
