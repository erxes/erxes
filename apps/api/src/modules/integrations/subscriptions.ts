import type { AutomationDefinition } from '@erxes/core-contract';
import {
  automations,
  type Db,
  integrationSubscriptions,
  newId,
  requestOrgId,
  withOrg,
  integrationConnections,
} from '@erxes/core-db';
import { and, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { fail } from '~/http/errors';
import { hmacSha256, randomToken, sha256 } from '~/lib/crypto';
import { coreKey } from '~/lib/coreKey';
import { inOrder } from '~/lib/sequence';
import { appLink } from '~/modules/email/email';
import { publishCoreEvents } from '~/modules/events/events.service';
import { defineJob } from '~/modules/jobs/jobs';
import { readSecret, removeSecretAs, saveSecret } from '~/modules/secrets/vault';
import { type App, appOf, channelOf, HOOK_CHANNEL, paramsSchema, triggerOf } from './apps';
import { connectionsWithSecret } from './connections';
import type { KeyedIntegration } from './define';
import { freshKeys } from './oauth';

type AppTrigger = Extract<AutomationDefinition['trigger'], { kind: 'app' }>;

type Subscription = typeof integrationSubscriptions.$inferSelect;

const MAX_FAILURES = 5;

const sorted = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(sorted);

  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value)
        .toSorted(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, sorted(item)]),
    );

  return value;
};

const paramsKeyOf = (params: unknown) => sha256(JSON.stringify(sorted(params)));

export const hookSignature = (subscriptionId: string) =>
  hmacSha256(coreKey('erxes-integration-hook-v1'), subscriptionId, 'base64url');

const hookUrl = (client: Db, subscriptionId: string) =>
  appLink(client, `/core/v1/integrations/hooks/${subscriptionId}/${hookSignature(subscriptionId)}`);

export const resolveAppTrigger = (trigger: AppTrigger) => {
  const app = appOf(trigger.app);
  const definition = app && triggerOf(app.key, trigger.trigger);

  if (!app || !definition)
    return {
      ok: false as const,
      problem: `Unknown app trigger ${trigger.app}.${trigger.trigger}`,
    };

  const params = (paramsSchema(app, definition) ?? z.object({})).safeParse(trigger.params);

  if (!params.success)
    return {
      ok: false as const,
      problem: `${app.name}: ${params.error.issues[0]?.message ?? 'check the trigger settings'}`,
    };

  return { ok: true as const, app, definition, params: params.data };
};

const subscriptionFor = async (tx: Db, trigger: AppTrigger) => {
  const resolved = resolveAppTrigger(trigger);

  if (!resolved.ok)
    throw fail('INVALID_AUTOMATION', resolved.problem, { problems: [resolved.problem] });

  const channel = channelOf(resolved.definition);
  const paramsKey = paramsKeyOf(resolved.params);

  const identity = and(
    eq(integrationSubscriptions.connectionId, trigger.connectionId),
    eq(integrationSubscriptions.channel, channel),
    eq(integrationSubscriptions.paramsKey, paramsKey),
  );

  const [found] = await tx
    .select({ id: integrationSubscriptions.id })
    .from(integrationSubscriptions)
    .where(identity)
    .limit(1);

  if (found) return found.id;

  const secretId = await saveSecret(tx, randomToken(32));

  const [made] = await tx
    .insert(integrationSubscriptions)
    .values({
      id: newId(),
      connectionId: trigger.connectionId,
      app: resolved.app.key,
      channel,
      params: resolved.params,
      paramsKey,
      secretId,
      nextPollAt: resolved.definition.via === 'poll' ? new Date() : null,
    })
    .onConflictDoNothing()
    .returning({ id: integrationSubscriptions.id });

  if (made) return made.id;

  await removeSecretAs(tx, 'core', secretId);

  const [raced] = await tx
    .select({ id: integrationSubscriptions.id })
    .from(integrationSubscriptions)
    .where(identity)
    .limit(1);

  if (!raced) throw new Error('integration subscription vanished while it was being made');

  return raced.id;
};

export const enqueueSync = (tx: Db, id: string) =>
  subscriptionSync.enqueueNow(tx, {
    orgId: requestOrgId(),
    payload: { subscriptionId: id },
    dedupeKey: `integration-subscription:${id}`,
  });

const removeSubscription = async (tx: Db, subscription: Subscription) => {
  await tx.delete(integrationSubscriptions).where(eq(integrationSubscriptions.id, subscription.id));
  await removeSecretAs(tx, 'core', subscription.secretId);
};

const triggersInUse = async (tx: Db, id: string) => {
  const rows = await tx
    .selectDistinct({ event: automations.triggerEvent })
    .from(automations)
    .where(and(eq(automations.subscriptionId, id), eq(automations.status, 'active')));

  return rows.flatMap((row) => row.event.split('.').slice(2)).toSorted();
};

const sameList = (a: string[], b: string[]) =>
  a.length === b.length && a.every((item, index) => item === b[index]);

const refresh = (tx: Db, ids: string[]) =>
  inOrder(ids, async (id) => {
    const [subscription] = await tx
      .select()
      .from(integrationSubscriptions)
      .where(eq(integrationSubscriptions.id, id))
      .for('update');

    if (!subscription) return;

    const triggers = await triggersInUse(tx, id);

    if (sameList(triggers, subscription.triggers.toSorted())) return;

    if (subscription.channel !== HOOK_CHANNEL && !triggers.length) {
      await removeSubscription(tx, subscription);

      return;
    }

    const hook = subscription.channel === HOOK_CHANNEL;

    await tx
      .update(integrationSubscriptions)
      .set({ triggers, status: hook ? 'syncing' : subscription.status, updatedAt: sql`now()` })
      .where(eq(integrationSubscriptions.id, id));

    if (hook) await enqueueSync(tx, id);
  });

export const listenFor = async (
  tx: Db,
  automationId: string,
  definition: AutomationDefinition | null,
) => {
  const [row] = await tx
    .select({ subscriptionId: automations.subscriptionId })
    .from(automations)
    .where(eq(automations.id, automationId))
    .limit(1);

  const next =
    definition?.trigger.kind === 'app' ? await subscriptionFor(tx, definition.trigger) : null;

  if (row?.subscriptionId !== next)
    await tx
      .update(automations)
      .set({ subscriptionId: next })
      .where(eq(automations.id, automationId));

  await refresh(
    tx,
    [...new Set([row?.subscriptionId, next])].flatMap((id) => (id ? [id] : [])),
  );
};

export const subscriptionState = async (tx: Db, id: string) => {
  const [subscription] = await tx
    .select()
    .from(integrationSubscriptions)
    .where(eq(integrationSubscriptions.id, id))
    .limit(1);

  const app = subscription ? appOf(subscription.app) : null;

  if (!subscription || !app) return null;

  return { subscription, app, secret: await readSecret(tx, subscription.secretId) };
};

export const connectionKeys = async (
  tx: Db,
  integration: KeyedIntegration,
  connectionId: string,
) => {
  const [row] = await connectionsWithSecret(tx)
    .where(eq(integrationConnections.id, connectionId))
    .limit(1);

  if (row?.key !== integration.key)
    throw fail('INVALID_STEP_INPUT', `Pick a ${integration.name} connection`);

  if (row.status !== 'active')
    throw fail('NOT_ACTIVE', `The ${integration.name} connection is off`);

  return freshKeys(tx, integration, row);
};

export const markFailed = async (tx: Db, subscription: Subscription, error: string) => {
  const failures = subscription.failures + 1;
  const broken = failures >= MAX_FAILURES || subscription.channel === HOOK_CHANNEL;

  await tx
    .update(integrationSubscriptions)
    .set({
      failures,
      lastError: error.slice(0, 1000),
      status: broken ? 'broken' : subscription.status,
      updatedAt: sql`now()`,
    })
    .where(eq(integrationSubscriptions.id, subscription.id));

  if (!broken || subscription.status === 'broken') return failures;

  await publishCoreEvents(tx, {
    type: 'core.integration.trigger_failed',
    entityType: 'integration_subscription',
    entityId: subscription.id,
    payload: {
      app: subscription.app,
      connectionId: subscription.connectionId,
      triggers: subscription.triggers,
      error: error.slice(0, 1000),
    },
  });

  return failures;
};

const SyncPayload = z.object({ subscriptionId: z.string() });

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

const hookEvents = (app: App, triggers: string[]) => [
  ...new Set(
    app.triggers.flatMap((trigger) =>
      trigger.via === 'hook' && triggers.includes(trigger.key) ? [trigger.on] : [],
    ),
  ),
];

const sync = async (orgId: string, id: string) => {
  const state = await withOrg(orgId, async (tx) => {
    const found = await subscriptionState(tx, id);

    if (!found) return null;

    return {
      ...found,
      keys: await connectionKeys(tx, found.app, found.subscription.connectionId),
      url: await hookUrl(tx, id),
    };
  });

  if (!state?.app.hooks) return;

  const { subscription, app, keys, secret } = state;
  const hooks = state.app.hooks;
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
    url: state.url,
    secret,
    events: hookEvents(app, subscription.triggers),
    externalId: subscription.externalId,
  });

  await withOrg(orgId, async (tx) => {
    if (made.secret) await saveSecret(tx, made.secret, subscription.secretId);

    await tx
      .update(integrationSubscriptions)
      .set({
        externalId: made.externalId,
        status: 'listening',
        failures: 0,
        lastError: null,
        updatedAt: sql`now()`,
      })
      .where(eq(integrationSubscriptions.id, id));
  });
};

export const subscriptionSync = defineJob({
  queue: 'integrations.subscription.sync',
  payload: SyncPayload,
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
