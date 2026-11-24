import type { AutomationDefinition } from '@erxes/core-contract';
import { automations, type Db, integrationSubscriptions, newId } from '@erxes/core-db';
import { and, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { fail } from '~/http/errors';
import { randomToken, sha256 } from '~/lib/crypto';
import { inOrder } from '~/lib/sequence';
import { forgetTriggerData } from '~/modules/automations/eventData';
import { removeSecretAs, saveSecret } from '~/modules/secrets/vault';
import { appOf, channelOf, HOOK_CHANNEL, paramsSchema, triggerOf } from './apps';
import { removeSubscription, sameTriggers } from './subscriptionState';
import { enqueueSync } from './subscriptionSync';

type AppTrigger = Extract<AutomationDefinition['trigger'], { kind: 'app' }>;

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

const routeKeyOf = (resolved: Extract<ReturnType<typeof resolveAppTrigger>, { ok: true }>) => {
  const { hooks } = resolved.app;

  return resolved.definition.via === 'hook' && hooks?.appWide
    ? hooks.route(hooks.scope.parse(resolved.params))
    : null;
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
      routeKey: routeKeyOf(resolved),
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

const triggersInUse = async (tx: Db, id: string) => {
  const rows = await tx
    .selectDistinct({ event: automations.triggerEvent })
    .from(automations)
    .where(and(eq(automations.subscriptionId, id), eq(automations.status, 'active')));

  return rows.flatMap((row) => row.event.split('.').slice(2)).toSorted();
};

const refresh = (tx: Db, ids: string[]) =>
  inOrder(ids, async (id) => {
    const [subscription] = await tx
      .select()
      .from(integrationSubscriptions)
      .where(eq(integrationSubscriptions.id, id))
      .for('update');

    if (!subscription) return;

    const triggers = await triggersInUse(tx, id);

    if (sameTriggers(triggers, subscription.triggers)) return;

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

  if (row?.subscriptionId && next && row.subscriptionId !== next)
    await forgetTriggerData(tx, automationId);

  await refresh(
    tx,
    [...new Set([row?.subscriptionId, next])].flatMap((id) => (id ? [id] : [])),
  );
};
