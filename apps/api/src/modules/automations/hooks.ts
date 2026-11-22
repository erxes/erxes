import type { AutomationDefinition, AutomationFieldPath, HookSubject } from '@erxes/core-contract';
import { automations, companies, customers, type Db } from '@erxes/core-db';
import { eq, type SQL, sql } from 'drizzle-orm';
import { z } from 'zod';
import { fail } from '~/http/errors';
import { normalizeEmail, normalizePhone } from '~/lib/contacts';
import { coreKey } from '~/lib/coreKey';
import { hmacSha256 } from '~/lib/crypto';
import { appLink } from '~/modules/email/email';
import { text } from './actions/context';
import { REPLY_ACTION } from './actions/reply';
import { automationChecker } from './conditionCheck';
import { conditionsHold, startRun } from './consumer';
import { eachStep } from './cursor';
import { labelOf } from './dataFields';
import { learnedHookData, rememberHookData } from './eventData';
import { loadSubjects } from './subjects';
import { render } from './templates';

type AutomationRow = typeof automations.$inferSelect;

type HookTrigger = Extract<AutomationDefinition['trigger'], { kind: 'webhook' }>;

export const hookSignature = (automationId: string) =>
  hmacSha256(coreKey('erxes-automation-hook-v1'), automationId, 'base64url');

const hookPath = (automationId: string) =>
  `/core/v1/automations/hooks/${automationId}/${hookSignature(automationId)}`;

const isHook = (row: { definition: AutomationDefinition }) =>
  row.definition.trigger.kind === 'webhook';

export const withHookUrls = async <T extends { id: string; definition: AutomationDefinition }>(
  client: Db,
  rows: T[],
) => {
  const origin = rows.some(isHook) ? await appLink(client, '') : null;

  return rows.map((row) => ({
    ...row,
    hookUrl: origin !== null && isHook(row) ? `${origin}${hookPath(row.id)}` : null,
  }));
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

const lookupBy = (subject: HookSubject, value: string): SQL => {
  if (subject.type === 'company')
    return subject.by === 'id'
      ? eq(companies.id, value)
      : sql`lower(${companies.primaryName}) = ${value.toLowerCase()}`;

  switch (subject.by) {
    case 'id':
      return eq(customers.id, value);
    case 'primaryEmail':
      return sql`lower(${customers.primaryEmail}) = ${normalizeEmail(value)}`;
    case 'primaryPhone':
      return eq(customers.primaryPhone, normalizePhone(value));
  }
};

export const findHookSubject = async (
  client: Db,
  subject: HookSubject,
  context: Record<string, unknown>,
) => {
  const value = text(render(subject.value, context))?.trim();

  if (!value) return null;

  const [found] = await loadSubjects(client, subject.type, lookupBy(subject, value), { limit: 1 });

  return found ?? null;
};

export const noHookSubject = () =>
  fail('SUBJECT_NOT_FOUND', 'No customer or company matches this request');

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
    .select({ definition: automations.definition })
    .from(automations)
    .where(eq(automations.id, automationId))
    .limit(1);

  if (!row || !isHook(row)) return [];

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
