import { type Db, integrationSubscriptions, withOrg, withSystem } from '@erxes/core-db';
import { and, asc, eq, isNotNull, lte, ne, sql } from 'drizzle-orm';
import { inOrder } from '~/lib/sequence';
import { logger } from '~/logger';
import { publishCoreEvents } from '~/modules/events/events.service';
import { describeError, defineSchedule } from '~/modules/jobs/jobs';
import { appEventType } from '@erxes/core-contract';
import { HOOK_CHANNEL, triggerOf } from './apps';
import { connectionKeys, markFailed, subscriptionState } from './subscriptions';

const log = logger.child({ component: 'integration-polls' });

const BATCH = 50;

const LEASE_MINUTES = 10;

const MAX_BACKOFF_MINUTES = 360;

const minutesFromNow = (minutes: number) => new Date(Date.now() + minutes * 60_000);

const claimDue = () =>
  withSystem('claim due integration polls', async (tx) => {
    const due = tx
      .select({ id: integrationSubscriptions.id })
      .from(integrationSubscriptions)
      .where(
        and(
          isNotNull(integrationSubscriptions.nextPollAt),
          lte(integrationSubscriptions.nextPollAt, sql`now()`),
          ne(integrationSubscriptions.channel, HOOK_CHANNEL),
        ),
      )
      .orderBy(asc(integrationSubscriptions.nextPollAt))
      .limit(BATCH)
      .for('update', { skipLocked: true });

    return tx
      .update(integrationSubscriptions)
      .set({ nextPollAt: minutesFromNow(LEASE_MINUTES) })
      .where(sql`${integrationSubscriptions.id} in ${due}`)
      .returning({ id: integrationSubscriptions.id, orgId: integrationSubscriptions.orgId });
  });

const loaded = (tx: Db, id: string) =>
  subscriptionState(tx, id).then((state) => {
    const trigger = state && triggerOf(state.app.key, state.subscription.channel);

    return state && trigger?.via === 'poll' ? { ...state, trigger } : null;
  });

const pollOne = async (orgId: string, id: string) => {
  const state = await withOrg(orgId, (tx) => loaded(tx, id));

  if (!state) return;

  const { subscription, trigger, app } = state;

  try {
    const keys = await withOrg(orgId, (tx) => connectionKeys(tx, app, subscription.connectionId));

    const polled = await trigger.poll({
      keys,
      params: subscription.params,
      cursor: subscription.cursor,
    });

    const first = subscription.cursor === null;

    await withOrg(orgId, async (tx) => {
      if (!first)
        await publishCoreEvents(
          tx,
          polled.items.map((item) => ({
            type: appEventType(app.key, trigger.key),
            entityType: 'integration_subscription',
            entityId: id,
            payload: item.payload,
            dedupeKey: `${id}:${trigger.key}:${item.id}`,
          })),
        );

      await tx
        .update(integrationSubscriptions)
        .set({
          cursor: polled.cursor ?? subscription.cursor,
          nextPollAt: minutesFromNow(trigger.everyMinutes),
          status: 'listening',
          failures: 0,
          lastError: null,
          ...(polled.items.length && !first ? { lastDeliveryAt: sql`now()` } : {}),
          updatedAt: sql`now()`,
        })
        .where(eq(integrationSubscriptions.id, id));
    });
  } catch (error) {
    const message = describeError(error);

    log.warn({ orgId, subscription: id, app: app.key, err: error }, 'integration poll failed');

    await withOrg(orgId, async (tx) => {
      const failures = await markFailed(tx, subscription, message);

      await tx
        .update(integrationSubscriptions)
        .set({
          nextPollAt: minutesFromNow(
            Math.min(trigger.everyMinutes * 2 ** failures, MAX_BACKOFF_MINUTES),
          ),
        })
        .where(eq(integrationSubscriptions.id, id));
    });
  }
};

const pollDue = async () => {
  const due = await claimDue();

  await inOrder(due, ({ orgId, id }) => pollOne(orgId, id));
};

export const pollSchedule = defineSchedule({
  queue: 'integrations.poll',
  cron: '* * * * *',
  timeoutSeconds: 600,
  run: pollDue,
});
