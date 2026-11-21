import { type Db, QUEUE_SCHEMA, scopedOrgId } from '@erxes/core-db';
import { textArray } from '@erxes/plugin-sdk/filter';
import { sql } from 'drizzle-orm';

const jobTable = sql`${sql.identifier(QUEUE_SCHEMA)}.job`;

/**
 * Makes the scope's organisation's jobs in these queues that wait for a
 * later start due now, in the caller's transaction (pg-boss's tables have no
 * row level security, so this selects by the scope's organisation). Retries
 * waiting out their backoff stay as they are.
 */
export const startWaitingNow = async (client: Db, queues: string[]) => {
  const orgId = scopedOrgId();

  if (!orgId) throw new Error('waiting jobs are started in an organisation scope');

  const result = await client.execute(sql`
    update ${jobTable} set start_after = now()
    where name = any(${textArray(queues)})
      and state = 'created'
      and start_after > now()
      and data->>'orgId' = ${orgId}`);

  return result.rowCount ?? 0;
};
