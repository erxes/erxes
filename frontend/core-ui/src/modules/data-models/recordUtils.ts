import { z } from 'zod';
import { relationMembers } from './relationGroups';
import type { DataModel, DataModelRecord, ModelField } from './types';

export const recordDisplayLabel = (
  model: DataModel,
  fields: ModelField[],
  record: DataModelRecord,
): string => {
  const textFields = fields.filter((field) =>
    ['text', 'phone', 'textarea'].includes(field.type),
  );
  const selected = model.recordLabelField
    ? textFields.filter((field) => field._id === model.recordLabelField)
    : textFields.slice(0, 3);
  return (
    selected
      .map((field) => record.values[field._id])
      .filter(
        (value): value is string =>
          typeof value === 'string' && Boolean(value.trim()),
      )
      .join(' · ') || record._id
  );
};

export const isModelFieldRequired = (field: ModelField): boolean =>
  field.required;

export const getWritableFields = (
  model: DataModel,
  fields: ModelField[],
): ModelField[] => {
  return fields.filter(
    (field) =>
      !field.archivedAt &&
      !field.relation?.isInverse &&
      model.recordFieldTypes.includes(field.type),
  );
};

export const isEmptyRecordValue = (value: unknown): boolean =>
  value === undefined ||
  value === null ||
  (typeof value === 'string' && value.trim() === '') ||
  (Array.isArray(value) && value.length === 0);

export const buildRecordPatch = (
  fields: ModelField[],
  values: Record<string, unknown>,
  changed?: ReadonlySet<string>,
): Record<string, unknown> =>
  Object.fromEntries(
    fields
      .filter((field) =>
        changed ? changed.has(field._id) : values[field._id] !== undefined,
      )
      .map((field) => [
        field._id,
        values[field._id] === '' || values[field._id] === undefined
          ? null
          : values[field._id],
      ]),
  );

export const createRecordValuesSchema = (
  fields: ModelField[],
  writable: ModelField[],
  previous: Record<string, unknown> | undefined,
  validate: (field: ModelField, value: unknown) => string | null,
) =>
  z
    .object({ values: z.record(z.unknown()) })
    .superRefine(({ values }, context) => {
      for (const field of fields) {
        const value = values[field._id];
        const fail = (message: string) =>
          context.addIssue({
            code: 'custom',
            path: ['values', field._id],
            message,
          });
        const members = relationMembers(field, fields);
        const populated = members.filter(
          (entry) => !isEmptyRecordValue(values[entry._id]),
        );
        if (field.relation?.morphId && field._id === members[0]?._id) {
          if (!field.relation.multiple && populated.length > 1)
            fail('Choose one record across the selected objects.');
          const count = populated.reduce((sum, entry) => {
            const selected = values[entry._id];
            return sum + (Array.isArray(selected) ? selected.length : 1);
          }, 0);
          if (count > 100) fail('Choose up to 100 linked records in total.');
        }
        if (isModelFieldRequired(field) && !populated.length) {
          fail(`${field.label} is required.`);
          continue;
        }
        // Existing archived choices and unsupported historical data survive an
        // unrelated edit. The server likewise validates only the submitted patch.
        if (
          !writable.some((entry) => entry._id === field._id) ||
          (previous &&
            JSON.stringify(previous[field._id]) === JSON.stringify(value))
        )
          continue;
        const message = validate(field, value);
        if (message) {
          fail(message);
          continue;
        }
        if (isEmptyRecordValue(value)) continue;
        if (
          field.type === 'number' &&
          (typeof value !== 'number' || !Number.isFinite(value))
        )
          fail('Enter a finite number.');
        if (
          field.type === 'date' &&
          (typeof value !== 'string' || Number.isNaN(Date.parse(value)))
        )
          fail('Enter a valid date.');
        if (field.type === 'boolean' && typeof value !== 'boolean')
          fail('Choose true or false.');
        if (['select', 'radio', 'multiSelect', 'check'].includes(field.type)) {
          const options = new Set(field.options.map((option) => option.value));
          const choices = Array.isArray(value) ? value : [value];
          if (
            choices.some(
              (choice) => typeof choice !== 'string' || !options.has(choice),
            )
          )
            fail('Choose an active option.');
        }
      }
    });

export const formatRecordValue = (
  field: ModelField,
  value: unknown,
): string => {
  if (value === undefined || value === null || value === '') return '—';
  if (field.type === 'relation') {
    const display = (entry: unknown): string =>
      entry && typeof entry === 'object' && '_id' in entry
        ? String(entry._id)
        : String(entry);
    return Array.isArray(value)
      ? value.map(display).join(', ') || '—'
      : display(value);
  }
  if (Array.isArray(value))
    return (
      value
        .map(
          (item) =>
            field.options?.find((option) => option.value === item)?.label ??
            String(item),
        )
        .join(', ') || '—'
    );
  if (field.type === 'boolean') return value === true ? 'Yes' : 'No';
  if (field.type === 'date' && typeof value === 'string') {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toLocaleString();
  }
  return (
    field.options?.find((option) => option.value === value)?.label ??
    (typeof value === 'object' ? JSON.stringify(value) : String(value))
  );
};

export const localDateTimeValue = (value: unknown): string => {
  if (typeof value !== 'string' || !value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 19);
};

export const formatModelFieldValue = (
  field: ModelField,
  fields: ModelField[],
  read: (member: ModelField) => unknown,
): string => {
  if (!field.relation?.morphId) return formatRecordValue(field, read(field));
  return (
    relationMembers(field, fields)
      .filter((member) => !isEmptyRecordValue(read(member)))
      .map(
        (member) =>
          `${
            member.relation?.targetModelLabel ??
            member.relation?.targetModelName ??
            'Object'
          }: ${formatRecordValue(member, read(member))}`,
      )
      .join('; ') || '—'
  );
};
