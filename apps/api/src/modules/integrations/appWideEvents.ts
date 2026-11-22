import { withOrg } from '@erxes/core-db';
import { z } from 'zod';
import { inOrder } from '~/lib/sequence';
import { logger } from '~/logger';
import { publishCoreEvents } from '~/modules/events/events.service';
import { defineJob } from '~/modules/jobs/jobs';
import { type App, publishedEvents } from './apps';
import type { AppEvent } from './define';
import {
  connectionKeys,
  connectionOn,
  delivered,
  type Subscription,
  subscriptionState,
} from './subscriptionState';

const log = logger.child({ component: 'integration-app-events' });

const appWideOf = (app: App) => (app.hooks?.appWide ? app.hooks : null);

const heard = (app: App, subscription: Subscription, event: AppEvent) =>
  app.triggers.some(
    (trigger) =>
      trigger.via === 'hook' &&
      trigger.on === event.type &&
      subscription.triggers.includes(trigger.key),
  );

const Enrich = z.object({
  subscriptionId: z.string(),
  id: z.string(),
  type: z.string(),
  payload: z.record(z.string(), z.unknown()),
});

const enrichAndPublish = async (orgId: string, input: z.infer<typeof Enrich>) => {
  const state = await withOrg(orgId, async (tx) => {
    const found = await subscriptionState(tx, input.subscriptionId);
    const hooks = found && appWideOf(found.app);

    return (
      found &&
      hooks && {
        ...found,
        hooks,
        keys: await connectionKeys(tx, found.app, found.subscription.connectionId),
      }
    );
  });

  const enrich = state?.hooks.enrich?.[input.type];

  if (!state || !enrich) return;

  const { app, subscription, hooks, keys } = state;

  const payload = await enrich({
    keys,
    scope: hooks.scope.parse(subscription.params),
    payload: input.payload,
  });

  await withOrg(orgId, (tx) =>
    publishCoreEvents(tx, publishedEvents(app, subscription, { ...input, payload })),
  );
};

const eventEnrich = defineJob({
  queue: 'integrations.event.enrich',
  payload: Enrich,
  retry: { attempts: 4, delay: 20, maxDelay: 300 },
  handle: (job) => enrichAndPublish(job.orgId, job.payload),
  onDead(job, error) {
    log.warn(
      {
        orgId: job.orgId,
        subscription: job.payload.subscriptionId,
        event: job.payload.type,
        eventId: job.payload.id,
        err: error,
      },
      'app event dropped: its details could not be fetched',
    );

    return Promise.resolve();
  },
});

export const APP_WIDE_JOBS = [eventEnrich];

export const deliverToOrg = (orgId: string, items: { id: string; events: AppEvent[] }[]) =>
  withOrg(orgId, async (tx) => {
    let published = 0;

    await inOrder(items, async ({ id, events }) => {
      const state = await subscriptionState(tx, id);
      const hooks = state && appWideOf(state.app);

      if (!state || !hooks || !(await connectionOn(tx, state.subscription.connectionId))) return;

      const { app, subscription } = state;
      const wanted = events.filter((event) => heard(app, subscription, event));
      const enriched = (event: AppEvent) => hooks.enrich?.[event.type] !== undefined;
      const later = wanted.filter(enriched);

      const now = wanted
        .filter((event) => !enriched(event))
        .flatMap((event) => publishedEvents(app, subscription, event));

      await publishCoreEvents(tx, now);
      await eventEnrich.enqueueAll(
        tx,
        later.map((event) => ({
          orgId,
          payload: { subscriptionId: id, ...event },
          dedupeKey: `integration-enrich:${id}:${event.type}:${event.id}`,
        })),
      );

      if (events.length) await delivered(tx, id);

      published += now.length + later.length;
    });

    return published;
  });
