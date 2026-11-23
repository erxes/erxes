import {
  type AutomationDefinition,
  type AutomationFieldPath,
  HookSample,
} from '@erxes/core-contract';
import { automations, type Db } from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { coreKey } from '~/lib/coreKey';
import { hmacSha256 } from '~/lib/crypto';
import { appLink } from '~/modules/email/email';
import { REPLY_ACTION } from './actions/reply';
import { automationChecker } from './conditionCheck';
import { conditionsHold, startRun } from './consumer';
import { eachStep } from './cursor';
import { labelOf } from './dataFields';
import { forgetHookData, learnedHookData, rememberHookData } from './eventData';
import { findHookSubject } from './hookSubject';

type AutomationRow = typeof automations.$inferSelect;

type HookTrigger = Extract<AutomationDefinition['trigger'], { kind: 'webhook' }>;

export const hookSignature = (automationId: string) =>
  hmacSha256(coreKey('erxes-automation-hook-v1'), automationId, 'base64url');

const hookPath = (automationId: string) =>
  `/core/v1/automations/hooks/${automationId}/${hookSignature(automationId)}`;

export const withHookUrls = async <T extends { id: string; state: AutomationRow['state'] }>(
  client: Db,
  rows: T[],
) => {
  const origin = rows.length ? await appLink(client, '') : '';

  return rows.map((row) => ({
    ...row,
    hookUrl: `${origin}${hookPath(row.id)}`,
    hookSample: HookSample.safeParse(row.state.hookSample).data ?? null,
  }));
};

const MAX_SAMPLE_BYTES = 64_000;

export const saveHookSample = async (
  tx: Db,
  automation: { id: string; orgId: string },
  request: { body: unknown; query: Record<string, unknown> },
) => {
  const small = JSON.stringify(request.body ?? null).length <= MAX_SAMPLE_BYTES;

  const sample = {
    body: small ? (request.body ?? null) : null,
    query: request.query,
    at: new Date().toISOString(),
  };

  await tx
    .update(automations)
    .set({
      state: sql`${automations.state} || jsonb_build_object('hookSample', ${JSON.stringify(sample)}::jsonb)`,
    })
    .where(eq(automations.id, automation.id));
  await forgetHookData(tx, automation.id);
  await rememberHookData(tx, automation.id, request);

  const signal = JSON.stringify({
    o: automation.orgId,
    k: 'topic',
    t: `automations.runs:${automation.id}`,
  });

  await tx.execute(sql`select pg_notify('core_live', ${signal})`);

  return sample;
};

export const HookRequest = z.object({
  method: z.string().max(20).default('POST'),
  query: z.record(z.string(), z.json()).default({}),
  headers: z.record(z.string(), z.string()).default({}),
  body: z.json().nullable().default(null),
});

export type HookRequest = z.infer<typeof HookRequest>;

export const hookEvent = (request: HookRequest) => ({
  type: 'webhook',
  occurredAt: new Date().toISOString(),
  payload: request,
});

export const replySteps = (definition: AutomationDefinition) => {
  const ids: string[] = [];

  eachStep(definition.steps, (step) => {
    if (step.type === 'action' && step.action === REPLY_ACTION) ids.push(step.id);
  });

  return ids;
};

export const startHookRun = async (
  tx: Db,
  automation: AutomationRow,
  definition: AutomationDefinition,
  trigger: HookTrigger,
  start: { eventId: string; request: HookRequest },
) => {
  const event = hookEvent(start.request);

  await rememberHookData(tx, automation.id, start.request);

  const subject = trigger.subject ? await findHookSubject(tx, trigger.subject, { event }) : null;

  if (trigger.subject && !subject) return { kind: 'no-subject' as const };

  const ref = subject ? { type: subject.type, id: subject.id } : null;

  const matched = await conditionsHold(
    () =>
      automationChecker(tx, automation).holds(ref, trigger.conditions, {
        event,
        subject,
        steps: {},
      }),
    { automation: automation.id, event: start.eventId },
  );

  const run = matched
    ? await startRun(tx, automation, definition, {
        eventId: start.eventId,
        eventType: 'webhook',
        subject: ref,
        event,
        loaded: subject,
      })
    : null;

  return run ? { kind: 'started' as const, run } : { kind: 'skipped' as const };
};

const requestField = (path: string, label: string, type: AutomationFieldPath['type']) => ({
  path,
  label,
  type,
  group: 'event' as const,
  groupLabel: 'Webhook request',
});

export const hookFields = async (client: Db, automationId: string) => {
  const [row] = await client
    .select({ id: automations.id })
    .from(automations)
    .where(eq(automations.id, automationId))
    .limit(1);

  if (!row) return [];

  const learned = await learnedHookData(client, automationId);

  return [
    requestField('event.payload.method', 'Request method', 'text'),
    requestField('event.payload.body', 'Request body', 'text'),
    ...learned.body.map(({ key, kind }) =>
      requestField(`event.payload.body.${key}`, labelOf(key), kind),
    ),
    ...learned.query.map(({ key, kind }) =>
      requestField(`event.payload.query.${key}`, `Query: ${labelOf(key)}`, kind),
    ),
  ];
};
