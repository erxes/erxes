import type { IntegrationFormField, IntegrationFormValues } from '@erxes/core-contract';
import { callerUserId, type Db, integrationSetups } from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { oneRow } from '~/lib/rows';
import { managedDefinition, type PluginDefinition } from './definitions';
import { openValues, sealValues } from './vault';

type SetupRow = typeof integrationSetups.$inferSelect;

const findSetup = async (client: Db, ref: string): Promise<SetupRow | undefined> => {
  const [row] = await client
    .select()
    .from(integrationSetups)
    .where(eq(integrationSetups.integration, ref))
    .limit(1);

  return row;
};

const sealedOf = (row: SetupRow | undefined) =>
  row?.secretSealed ? openValues(row, row.secretSealed) : {};

export const getSetupValues = async (client: Db, ref: string) => {
  const row = await findSetup(client, ref);

  return row ? { ...row.values, ...sealedOf(row) } : null;
};

const setupFields = async (client: Db, ref: string) => {
  const definition = await managedDefinition(client, ref);

  if (!definition.spec.setup) throw fail('INVALID_TYPE', `${definition.spec.name} has no setup`);

  return definition.spec.setup.fields;
};

export const getSetup = async (client: Db, ref: string) => {
  await setupFields(client, ref);

  const row = await findSetup(client, ref);

  return row ?? { integration: ref, values: {}, sealedNames: [], updatedAt: null };
};

const isBlank = (value: unknown) => value === undefined || value === null || value === '';

interface FormProblem {
  key: string;
  message: string;
}

const valueProblem = (field: IntegrationFormField, value: unknown): string | null => {
  if (isBlank(value)) return field.required ? `${field.label} is required` : null;

  if (field.type === 'number') {
    return typeof value === 'number' ? null : `${field.label} must be a number`;
  }

  if (field.type === 'boolean') {
    return typeof value === 'boolean' ? null : `${field.label} must be yes or no`;
  }

  if (typeof value !== 'string') return `${field.label} must be text`;

  return field.type === 'select' && !field.options?.some((option) => option.value === value)
    ? `${field.label} must be one of its options`
    : null;
};

const formProblem = (
  fields: IntegrationFormField[],
  values: Record<string, unknown>,
): FormProblem | null => {
  const known = new Set(fields.map((field) => field.key));
  const unknown = Object.keys(values).find((key) => !known.has(key));

  if (unknown) return { key: unknown, message: `${unknown} is not a field of this form` };

  return (
    fields
      .map((field) => ({ key: field.key, message: valueProblem(field, values[field.key]) }))
      .flatMap(({ key, message }) => (message ? [{ key, message }] : []))[0] ?? null
  );
};

export const assertForm = (fields: IntegrationFormField[], values: Record<string, unknown>) => {
  const problem = formProblem(fields, values);

  if (problem) {
    throw fail('INVALID_INPUT', problem.message, {
      issues: [{ path: ['values', problem.key], message: problem.message }],
    });
  }
};

const filled = (values: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(values).filter(([, value]) => !isBlank(value)));

const only = (values: Record<string, unknown>, keys: Set<string>) =>
  Object.fromEntries(Object.entries(values).filter(([key]) => keys.has(key)));

export const removeSetup = async (client: Db, ref: string) => {
  await setupFields(client, ref);
  await client.delete(integrationSetups).where(eq(integrationSetups.integration, ref));

  return { ok: true as const };
};

const setupRow = (fields: IntegrationFormField[], values: Record<string, unknown>) => {
  assertForm(fields, values);

  const secretKeys = new Set(
    fields.filter((field) => field.type === 'secret').map((field) => field.key),
  );

  const kept = filled(values);
  const secrets = only(kept, secretKeys);
  const sealedNames = Object.keys(secrets).toSorted();

  return {
    values: Object.fromEntries(Object.entries(kept).filter(([key]) => !secretKeys.has(key))),
    secretSealed: sealedNames.length ? sealValues(secrets) : null,
    sealedNames,
    updatedBy: callerUserId(),
    updatedAt: sql`now()`,
  };
};

export const seedSetup = async (
  client: Db,
  definition: PluginDefinition,
  values: Record<string, unknown>,
) => {
  if (!definition.spec.setup) {
    const message = `${definition.spec.name} has no setup`;

    throw fail('INVALID_INPUT', message, { issues: [{ path: ['setup'], message }] });
  }

  await client
    .insert(integrationSetups)
    .values({ integration: definition.ref, ...setupRow(definition.spec.setup.fields, values) })
    .onConflictDoNothing({ target: [integrationSetups.orgId, integrationSetups.integration] });
};

export const saveSetup = async (client: Db, ref: string, values: IntegrationFormValues) => {
  const fields = await setupFields(client, ref);
  const existing = await findSetup(client, ref);
  const known = new Set(fields.map((field) => field.key));
  const merged = { ...only({ ...existing?.values, ...sealedOf(existing) }, known), ...values };
  const row = setupRow(fields, merged);

  return oneRow(
    await client
      .insert(integrationSetups)
      .values({ integration: ref, ...row })
      .onConflictDoUpdate({
        target: [integrationSetups.orgId, integrationSetups.integration],
        set: row,
      })
      .returning(),
  );
};
