import { AUTOMATION_FIELD_TYPES } from '@erxes/core-db/enums';
import { z } from 'zod';
import type { DataField } from './automationRuns';

export const keyLabel = (key: string) => {
  const words = key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replaceAll(/[_.]/g, ' ')
    .toLowerCase();

  return words.charAt(0).toUpperCase() + words.slice(1);
};

const unwrapped = (schema: z.core.$ZodType): z.core.$ZodType =>
  schema instanceof z.ZodOptional ||
  schema instanceof z.ZodNullable ||
  schema instanceof z.ZodDefault
    ? unwrapped(schema.unwrap())
    : schema;

const fieldType = (schema: z.core.$ZodType): DataField['type'] | null => {
  if (schema instanceof z.ZodNumber) return 'number';

  if (schema instanceof z.ZodBoolean) return 'boolean';

  if (schema instanceof z.ZodArray) return 'list';

  return schema instanceof z.ZodString || schema instanceof z.ZodEnum ? 'text' : null;
};

const FieldType = z.enum(AUTOMATION_FIELD_TYPES);

const RecordType = z.string().min(1);

export const payloadFields = (payload: z.ZodObject, prefix = ''): DataField[] =>
  Object.entries<z.core.$ZodType>(payload.shape).flatMap(([name, value]) => {
    const key = `${prefix}${name}`;
    const inner = unwrapped(value);

    if (inner instanceof z.ZodObject) return payloadFields(inner, `${key}.`);

    const meta = z.globalRegistry.get(value);
    const type = FieldType.safeParse(meta?.fieldType).data ?? fieldType(inner);
    const recordType = RecordType.safeParse(meta?.recordType).data;

    return type
      ? [{ key, label: meta?.title ?? keyLabel(key), type, ...(recordType && { recordType }) }]
      : [];
  });

export const learnsPayload = (payload: z.ZodObject) =>
  Object.values<z.core.$ZodType>(payload.shape).some(
    (value) => unwrapped(value) instanceof z.ZodRecord,
  );
