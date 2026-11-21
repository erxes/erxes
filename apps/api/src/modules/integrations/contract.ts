import { INTEGRATION_FIELD_MAX, IntegrationKey } from '@erxes/core-contract';
import { type Db, integrationPrograms } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { carriedBy, healedFields as healed, labelOf } from '~/modules/automations/dataFields';
import type { LoadedProgram } from './programs.service';

type Program = LoadedProgram['program'];

type Field = Program['outputs'][number];

const healedFields = (declared: Field[], real: Record<string, unknown>): Field[] =>
  healed(declared, carriedBy(real)).slice(0, INTEGRATION_FIELD_MAX);

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isBlank = (value: unknown) => value === undefined || value === null || value === '';

const isNumber = (value: unknown) =>
  typeof value === 'number'
    ? Number.isFinite(value)
    : typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value));

const problemOf = (field: Program['fields'][number], value: unknown) => {
  if (isBlank(value)) return field.required ? `${field.label} is required` : null;

  return field.type === 'number' && !isNumber(value) ? `${field.label} must be a number` : null;
};

export const inputProblem = (program: Program, input: Record<string, unknown>) =>
  program.fields.map((field) => problemOf(field, input[field.key])).find(Boolean) ?? null;

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
