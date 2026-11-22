import { type Db, eventData, type events } from '@erxes/core-db';
import { asc, eq, inArray, notLike } from 'drizzle-orm';
import { type Carried, carriedBy } from './dataFields';

type EventRow = typeof events.$inferSelect;

const SEEN = '';

const MAX_KEYS = 50;

const OUTPUT = 'output:';

const HOOK = 'hook:';

const HOOK_PARTS = ['body', 'query'] as const;

type HookPart = (typeof HOOK_PARTS)[number];

export const outputType = (action: string) => `${OUTPUT}${action}`;

export const isEventType = (type: string) => !type.startsWith(OUTPUT) && !type.startsWith(HOOK);

const hookType = (automationId: string, part: HookPart) => `${HOOK}${automationId}:${part}`;

const hookTypes = (automationId: string) => HOOK_PARTS.map((part) => hookType(automationId, part));

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const remember = async (tx: Db, type: string, data: Record<string, unknown>) => {
  const rows = await tx
    .select({ key: eventData.key })
    .from(eventData)
    .where(eq(eventData.type, type));

  const known = new Set(rows.map((row) => row.key));

  const fresh = [{ key: SEEN, kind: 'seen' as const }, ...carriedBy(data)]
    .filter((item) => !known.has(item.key))
    .slice(0, Math.max(0, MAX_KEYS + 1 - known.size));

  if (fresh.length === 0) return;

  await tx
    .insert(eventData)
    .values(fresh.map((item) => ({ type, ...item })))
    .onConflictDoNothing();
};

export const rememberEventData = async (tx: Db, event: EventRow) => {
  if (event.source === 'core') return;

  await remember(tx, event.type, event.payload);
};

export const rememberActionOutput = async (tx: Db, action: string, output: unknown) => {
  if (isRecord(output)) await remember(tx, outputType(action), output);
};

export const rememberHookData = async (
  tx: Db,
  automationId: string,
  request: { body: unknown; query: Record<string, unknown> },
) => {
  if (isRecord(request.body)) await remember(tx, hookType(automationId, 'body'), request.body);

  await remember(tx, hookType(automationId, 'query'), request.query);
};

export const forgetHookData = (tx: Db, automationId: string) =>
  tx.delete(eventData).where(inArray(eventData.type, hookTypes(automationId)));

const grouped = (rows: { type: string; key: string; kind: Carried['kind'] | 'seen' }[]) => {
  const learned = new Map<string, Carried[]>();

  for (const row of rows) {
    const carried = learned.get(row.type) ?? [];

    if (row.kind !== 'seen') carried.push({ key: row.key, kind: row.kind });

    learned.set(row.type, carried);
  }

  return learned;
};

const columns = { type: eventData.type, key: eventData.key, kind: eventData.kind };

export const learnedEventData = async (client: Db) =>
  grouped(
    await client
      .select(columns)
      .from(eventData)
      .where(notLike(eventData.type, `${HOOK}%`))
      .orderBy(asc(eventData.type), asc(eventData.createdAt), asc(eventData.key)),
  );

export const learnedHookData = async (client: Db, automationId: string) => {
  const learned = grouped(
    await client
      .select(columns)
      .from(eventData)
      .where(inArray(eventData.type, hookTypes(automationId)))
      .orderBy(asc(eventData.createdAt), asc(eventData.key)),
  );

  return {
    body: learned.get(hookType(automationId, 'body')) ?? [],
    query: learned.get(hookType(automationId, 'query')) ?? [],
  };
};
