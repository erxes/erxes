import { type Db, eventData, type events } from '@erxes/core-db';
import { asc, eq } from 'drizzle-orm';
import { type Carried, carriedBy } from './dataFields';

type EventRow = typeof events.$inferSelect;

const SEEN = '';

const MAX_KEYS = 50;

const OUTPUT = 'output:';

export const outputType = (action: string) => `${OUTPUT}${action}`;

export const isOutputType = (type: string) => type.startsWith(OUTPUT);

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

export const learnedEventData = async (client: Db) => {
  const rows = await client
    .select({ type: eventData.type, key: eventData.key, kind: eventData.kind })
    .from(eventData)
    .orderBy(asc(eventData.type), asc(eventData.createdAt), asc(eventData.key));

  const learned = new Map<string, Carried[]>();

  for (const row of rows) {
    const carried = learned.get(row.type) ?? [];

    if (row.kind !== 'seen') carried.push({ key: row.key, kind: row.kind });

    learned.set(row.type, carried);
  }

  return learned;
};
