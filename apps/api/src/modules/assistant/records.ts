import {
  type AssistantRecord,
  type AssistantRecordType,
  RECORD_IDS,
  recordLabel,
} from '@erxes/core-contract';
import { caller, type Db, savepoint } from '@erxes/core-db';
import { ORPCError } from '@orpc/server';
import { z } from 'zod';
import { memberMayCall } from '~/http/access';
import { inOrder } from '~/lib/sequence';
import { getAutomation } from '../automations/automations.service';
import { getCompany } from '../companies/companies.service';
import { getCustomer } from '../customers/customers.service';
import { findProduct } from '../products/productChecks';
import { getUser } from '../users/users.service';

export interface RecordIdentity {
  type: AssistantRecordType;
  id: string;
  label: string;
}

const READERS: Record<
  AssistantRecordType,
  { procedure: string; read: (client: Db, id: string) => Promise<unknown> }
> = {
  customer: { procedure: 'customers.get', read: getCustomer },
  company: { procedure: 'companies.get', read: getCompany },
  member: { procedure: 'users.get', read: getUser },
  product: { procedure: 'products.get', read: findProduct },
  automation: { procedure: 'automations.get', read: getAutomation },
};

const MAX_IDENTITIES = 25;

const Row = z.record(z.string(), z.unknown());

const unwrap = (schema: z.core.$ZodType): z.core.$ZodType => {
  if (
    schema instanceof z.ZodOptional ||
    schema instanceof z.ZodNullable ||
    schema instanceof z.ZodDefault ||
    schema instanceof z.ZodReadonly ||
    schema instanceof z.ZodNonOptional ||
    schema instanceof z.ZodLazy
  ) {
    return unwrap(schema.unwrap());
  }

  if (schema instanceof z.ZodPipe) {
    return unwrap(schema.out instanceof z.ZodTransform ? schema.in : schema.out);
  }

  return schema;
};

const identityOf = (type: AssistantRecordType, row: Record<string, unknown>) =>
  typeof row['id'] === 'string'
    ? { type, id: row['id'], label: recordLabel(type, row) ?? row['id'] }
    : null;

const visit = (schema: z.core.$ZodType, value: unknown, found: Map<string, RecordIdentity>) => {
  if (found.size >= MAX_IDENTITIES || value === null || value === undefined) return;

  const declared = unwrap(schema);

  if (declared instanceof z.ZodArray && Array.isArray(value)) {
    for (const item of value) visit(declared.element, item, found);

    return;
  }

  const row = Row.safeParse(value).data;

  if (!row) return;

  if (declared instanceof z.ZodRecord) {
    for (const item of Object.values(row)) visit(declared.valueType, item, found);

    return;
  }

  if (!(declared instanceof z.ZodObject)) return;

  const fields: Record<string, z.core.$ZodType> = declared.shape;
  const idField = fields['id'];
  const type = idField ? RECORD_IDS.get(idField)?.record : undefined;
  const identity = type ? identityOf(type, row) : null;

  if (identity) found.set(`${identity.type}:${identity.id}`, identity);

  for (const [key, child] of Object.entries(fields)) visit(child, row[key], found);
};

export const identitiesIn = (schema: unknown, value: unknown) => {
  const found = new Map<string, RecordIdentity>();

  if (schema instanceof z.ZodType) visit(schema, value, found);

  return [...found.values()].slice(0, MAX_IDENTITIES);
};

export const UNAVAILABLE: AssistantRecord = { available: false };

export const readRecord = async (
  type: AssistantRecordType,
  id: string,
): Promise<AssistantRecord> => {
  const reader = READERS[type];
  const who = caller();

  if (who.type !== 'user' || !memberMayCall(reader.procedure, who)) return UNAVAILABLE;

  const row = await savepoint((tx) => reader.read(tx, id)).catch((error: unknown) => {
    if (error instanceof ORPCError) return null;

    throw error;
  });

  const identity = identityOf(type, Row.safeParse(row).data ?? {});

  return identity ? { available: true, ...identity } : UNAVAILABLE;
};

export const readRecords = async (records: { type: AssistantRecordType; id: string }[]) => {
  const read: AssistantRecord[] = [];

  await inOrder(records, async ({ type, id }) => {
    read.push(await readRecord(type, id));
  });

  return read;
};
