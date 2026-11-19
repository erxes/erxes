import { schema, withSystem } from '@erxes/core-db';
import { and, eq, exists, inArray, isNull, lt, or, sql } from 'drizzle-orm';
import { inOrder } from '~/lib/sequence';
import { logger } from '~/logger';
import { agentByName, withHarness } from './host';
import { StorageBusy } from './storage';

/** How often the sweep runs (`agents.recover` in `lib/maintenance.ts`): it opens sleeps due before the next one. */
const SWEEP_MS = 60_000;

/** Task states that can run now, or once the tasks they wait for end. */
const LIVE = ['pending', 'running', 'waiting'] as const;

const log = logger.child({ component: 'agents' });

/**
 * Storages no server runs, their lease free or expired, with a task that can run now or wakes before
 * the next sweep: what a restart or a crash cut off. Read across organisations.
 */
const unfinished = () =>
  withSystem('agents: recovery', (tx) => {
    const { agentDurableMetadata: metadata, agentTasks: tasks } = schema;
    const dueBy = Date.now() + SWEEP_MS;

    return tx
      .select({ orgId: metadata.orgId, storageKey: metadata.storageKey })
      .from(metadata)
      .where(
        and(
          or(isNull(metadata.leaseOwner), lt(metadata.leaseUntil, sql`now()`)),
          exists(
            tx
              .select({ id: tasks.id })
              .from(tasks)
              .where(
                and(
                  eq(tasks.storageKey, metadata.storageKey),
                  or(
                    inArray(tasks.status, LIVE),
                    and(
                      eq(tasks.status, 'sleeping'),
                      sql`(${tasks.record}::jsonb #>> '{state,until}')::bigint <= ${dueBy}`,
                    ),
                  ),
                ),
              ),
          ),
        ),
      );
  });

/**
 * Opens on this server every conversation a restart or a crash left unfinished, and resumes its
 * tasks; it closes again once they are done. Returns the storage keys it resumed.
 */
export const recoverAgents = async () => {
  const resumed: string[] = [];

  await inOrder(await unfinished(), async ({ orgId, storageKey }) => {
    const split = storageKey.indexOf(':');
    const agent = split > 0 ? agentByName(storageKey.slice(0, split)) : undefined;

    if (!agent) {
      log.warn({ storageKey }, 'agents: no registered agent runs this unfinished conversation');

      return;
    }

    try {
      await withHarness(agent, { orgId, key: storageKey.slice(split + 1) }, async (harness) => {
        harness.resume();
      });
      resumed.push(storageKey);
    } catch (error) {
      // Another server took it since the read.
      if (error instanceof StorageBusy) return;

      log.warn({ err: error, storageKey }, 'agents: could not resume a conversation');
    }
  });

  if (resumed.length)
    log.info({ storageKeys: resumed }, 'agents: resumed unfinished conversations');

  return resumed;
};
