import { type Db, integrationSubscriptions, requestOrgId, withOrg } from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { coreKey } from '~/lib/coreKey';
import { hmacSha256 } from '~/lib/crypto';
import { appLink } from '~/modules/email/email';
import { defineJob } from '~/modules/jobs/jobs';
import { saveSecret } from '~/modules/secrets/vault';
import { hookEvents } from './apps';
import { appHookUrl, appVerifyToken, eventsInUse } from './appWide';
import { clientOf } from './oauth';
import {
  connectionKeys,
  markFailed,
  removeSubscription,
  subscriptionState,
} from './subscriptionState';

export const hookSignature = (subscriptionId: string) =>
  hmacSha256(coreKey('erxes-integration-hook-v1'), subscriptionId, 'base64url');

const hookUrl = (client: Db, subscriptionId: string) =>
  appLink(client, `/core/v1/integrations/hooks/${subscriptionId}/${hookSignature(subscriptionId)}`);

export const enqueueSync = (tx: Db, id: string) =>
  subscriptionSync.enqueueNow(tx, {
    orgId: requestOrgId(),
    payload: { subscriptionId: id },
    dedupeKey: `integration-subscription:${id}`,
  });

const finishRemoval = async (tx: Db, id: string) => {
  const [subscription] = await tx
    .select()
    .from(integrationSubscriptions)
    .where(eq(integrationSubscriptions.id, id))
    .for('update');

  if (!subscription) return;

  if (!subscription.triggers.length) {
    await removeSubscription(tx, subscription);

    return;
  }

  await tx
    .update(integrationSubscriptions)
    .set({ externalId: null, updatedAt: sql`now()` })
    .where(eq(integrationSubscriptions.id, id));
  await enqueueSync(tx, id);
};

const listening = (tx: Db, id: string, externalId: string) =>
  tx
    .update(integrationSubscriptions)
    .set({ externalId, status: 'listening', failures: 0, lastError: null, updatedAt: sql`now()` })
    .where(eq(integrationSubscriptions.id, id));

const loaded = (orgId: string, id: string) =>
  withOrg(orgId, async (tx) => {
    const found = await subscriptionState(tx, id);

    return (
      found && {
        ...found,
        keys: await connectionKeys(tx, found.app, found.subscription.connectionId),
      }
    );
  });

type Loaded = NonNullable<Awaited<ReturnType<typeof loaded>>>;

type AppWide = Extract<NonNullable<Loaded['app']['hooks']>, { appWide: true }>;

const syncAppWide = async (orgId: string, state: Loaded, hooks: AppWide) => {
  const { subscription, app, keys } = state;
  const { id } = subscription;
  const scope = hooks.scope.parse(subscription.params);
  const routeKey = hooks.route(scope);

  const setup = await withOrg(orgId, async (tx) => {
    const client = await clientOf(tx, app.key);

    return client && { client, url: await appHookUrl(tx, app.key, client.ref) };
  });

  if (!setup) throw new Error(`${app.name} has no app to hear its events: add one in Settings`);

  const { client, url } = setup;
  const events = await eventsInUse(app, { client: client.ref, orgId, routeKey });

  if (events.length)
    await hooks.subscribe({
      keys,
      scope,
      client,
      url,
      verifyToken: appVerifyToken(app.key, client.ref),
      events,
      appEvents: await eventsInUse(app, { client: client.ref, orgId }),
    });
  else if (subscription.externalId) await hooks.unsubscribe({ keys, scope });

  await withOrg(orgId, async (tx) => {
    if (subscription.triggers.length) await listening(tx, id, routeKey);
    else await finishRemoval(tx, id);
  });
};

const sync = async (orgId: string, id: string) => {
  const state = await loaded(orgId, id);
  const hooks = state?.app.hooks;

  if (!state || !hooks) return;

  if (hooks.appWide) {
    await syncAppWide(orgId, state, hooks);

    return;
  }

  const { subscription, app, keys, secret } = state;
  const scope = hooks.scope.parse(subscription.params);

  if (!subscription.triggers.length) {
    if (subscription.externalId)
      await hooks.unsubscribe({ keys, scope, externalId: subscription.externalId });

    await withOrg(orgId, (tx) => finishRemoval(tx, id));

    return;
  }

  const made = await hooks.subscribe({
    keys,
    scope,
    url: await withOrg(orgId, (tx) => hookUrl(tx, id)),
    secret,
    events: hookEvents(app, subscription.triggers),
    externalId: subscription.externalId,
  });

  await withOrg(orgId, async (tx) => {
    if (made.secret) await saveSecret(tx, made.secret, subscription.secretId);

    await listening(tx, id, made.externalId);
  });
};

export const subscriptionSync = defineJob({
  queue: 'integrations.subscription.sync',
  payload: z.object({ subscriptionId: z.string() }),
  retry: { attempts: 4, delay: 20, maxDelay: 300 },
  handle: (job) => sync(job.orgId, job.payload.subscriptionId),
  async onDead(job, error, tx) {
    const [subscription] = await tx
      .select()
      .from(integrationSubscriptions)
      .where(eq(integrationSubscriptions.id, job.payload.subscriptionId))
      .limit(1);

    if (subscription) await markFailed(tx, subscription, error);
  },
});
