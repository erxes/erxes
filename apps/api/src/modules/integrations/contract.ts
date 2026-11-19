import { INTEGRATION_FIELD_MAX, IntegrationDataField, IntegrationKey } from '@erxes/core-contract';
import { type Db, integrationPrograms } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import type { LoadedProgram } from './programs.service';

type Program = LoadedProgram['program'];

type Field = Program['outputs'][number];

type Kind = 'text' | 'number' | 'boolean' | 'list';

const FITS: Record<Kind, readonly Field['type'][]> = {
  text: ['text', 'date', 'member', 'select'],
  number: ['number', 'text'],
  boolean: ['boolean', 'text'],
  list: ['list', 'tags'],
};

const widened = (kind: Kind): Kind => (kind === 'list' ? 'list' : 'text');

const kindOf = (value: unknown): Kind | null => {
  if (typeof value === 'string') return 'text';

  if (typeof value === 'number') return 'number';

  if (typeof value === 'boolean') return 'boolean';

  return Array.isArray(value) ? 'list' : null;
};

const labelOf = (key: string) => {
  const words = key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replaceAll('_', ' ')
    .toLowerCase();

  return words.charAt(0).toUpperCase() + words.slice(1);
};

const carriedBy = (real: Record<string, unknown>) =>
  Object.entries(real).flatMap(([key, value]) => {
    const kind = IntegrationDataField.shape.key.safeParse(key).success ? kindOf(value) : null;

    return kind ? [{ key, kind }] : [];
  });

const healedFields = (declared: Field[], real: Record<string, unknown>): Field[] => {
  const carried = carriedBy(real);
  const kinds = new Map(carried.map(({ key, kind }) => [key, kind]));

  const corrected = declared.map((field) => {
    const kind = kinds.get(field.key);

    return kind && !FITS[kind].includes(field.type) ? { ...field, type: widened(kind) } : field;
  });

  const listed = new Set(declared.map((field) => field.key));

  const added = carried
    .filter(({ key }) => !listed.has(key))
    .map(({ key, kind }) => ({ key, label: labelOf(key), type: kind }));

  return [...corrected, ...added].slice(0, INTEGRATION_FIELD_MAX);
};

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const healedOutputs = (program: Program, result: unknown) => {
  if (!isRecord(result)) return null;

  const outputs = healedFields(program.outputs, result);

  return same(outputs, program.outputs) ? null : outputs;
};

export const saveOutputs = (client: Db, programId: string, outputs: Field[]) =>
  client.update(integrationPrograms).set({ outputs }).where(eq(integrationPrograms.id, programId));

export const healEvents = async (
  client: Db,
  program: Program,
  published: { event: string; payload: Record<string, unknown> }[],
) => {
  const byKey = new Map(program.events.map((event) => [event.key, event]));

  for (const item of published) {
    const known = byKey.get(item.event);

    if (!known && !IntegrationKey.safeParse(item.event).success) {
      throw new Error(`${program.label} publishes ${item.event}, which is not an event key`);
    }

    byKey.set(item.event, {
      key: item.event,
      label: known?.label ?? labelOf(item.event),
      fields: healedFields(known?.fields ?? [], item.payload),
    });
  }

  const events = [...byKey.values()].slice(0, INTEGRATION_FIELD_MAX);

  if (same(events, program.events)) return;

  await client
    .update(integrationPrograms)
    .set({ events })
    .where(eq(integrationPrograms.id, program.id));
};
