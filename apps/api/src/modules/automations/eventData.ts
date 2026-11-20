import type { DataField } from '@erxes/core-contract';
import { type Db, eventData, type events } from '@erxes/core-db';
import { asc, eq } from 'drizzle-orm';

type EventRow = typeof events.$inferSelect;

type Kind = (typeof eventData.$inferSelect)['kind'];

/** A key a placeholder can name (`{{event.payload.<key>}}`), as `DataField` accepts it. */
const KEY = /^[A-Za-z][A-Za-z0-9_]{0,59}$/;

/** The row that says the type happened at all, whatever it carried. */
const SEEN = '';

const MAX_KEYS = 50;

const kindOf = (value: unknown): Kind | null => {
  if (typeof value === 'string') return 'text';

  if (typeof value === 'number') return 'number';

  if (typeof value === 'boolean') return 'boolean';

  return Array.isArray(value) ? 'list' : null;
};

/** The keys of a payload whose values conditions can compare; nested objects and nulls are left out. */
const carriedBy = (payload: Record<string, unknown>) =>
  Object.entries(payload).flatMap(([key, value]) => {
    const kind = KEY.test(key) ? kindOf(value) : null;

    return kind ? [{ key, kind }] : [];
  });

/**
 * Remembers what a plugin's event carries, the first time each key shows up, so automations can
 * use it without the plugin listing it: at most `MAX_KEYS` keys a type. Core's own events list
 * theirs (`CORE_EVENT_TYPES`).
 */
export const rememberEventData = async (tx: Db, event: EventRow) => {
  if (event.source === 'core') return;

  const rows = await tx
    .select({ key: eventData.key })
    .from(eventData)
    .where(eq(eventData.type, event.type));

  const known = new Set(rows.map((row) => row.key));

  const fresh = [{ key: SEEN, kind: 'seen' as const }, ...carriedBy(event.payload)]
    .filter((item) => !known.has(item.key))
    .slice(0, Math.max(0, MAX_KEYS + 1 - known.size));

  if (fresh.length === 0) return;

  await tx
    .insert(eventData)
    .values(fresh.map((item) => ({ type: event.type, ...item })))
    .onConflictDoNothing();
};

const labelOf = (key: string) => {
  const words = key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replaceAll('_', ' ')
    .toLowerCase();

  return words.charAt(0).toUpperCase() + words.slice(1);
};

/**
 * What each event type that happened in this organisation has carried, by type: a type with no
 * entry has not happened since core began remembering.
 */
export const learnedEventData = async (client: Db) => {
  const rows = await client
    .select({ type: eventData.type, key: eventData.key, kind: eventData.kind })
    .from(eventData)
    .orderBy(asc(eventData.type), asc(eventData.createdAt), asc(eventData.key));

  const learned = new Map<string, DataField[]>();

  for (const row of rows) {
    const fields = learned.get(row.type) ?? [];

    if (row.kind !== 'seen') fields.push({ key: row.key, label: labelOf(row.key), type: row.kind });

    learned.set(row.type, fields);
  }

  return learned;
};
