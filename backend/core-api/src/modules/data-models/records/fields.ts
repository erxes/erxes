import { z } from 'zod';
import type { Connection } from 'mongoose';
import {
  getDataModelFieldModel,
  type IDataModelField,
} from '../fields/registry';
import { DATA_MODEL_RECORD_FIELD_TYPES } from './types';
import type { IDataModelRecordField, IDataModelRecordFields } from './types';
import { dataModelRecordIdSchema } from './validation';
import { DataModelRelations } from '../relations';

const textSchema = z.string().max(10000);
const listSchema = z.array(z.string().max(10000)).max(100);

export const normalizeDataModelRecordValue = (
  field: IDataModelRecordField,
  value: unknown,
): unknown => {
  if (!field.groupAvailable || field.repeating) {
    throw new Error(
      `${field.name}: a non-repeating group belonging to this model is required`,
    );
  }
  if (!DATA_MODEL_RECORD_FIELD_TYPES.some((type) => type === field.type)) {
    throw new Error(
      `${field.name}: ${field.type} is not supported by the custom-record runtime`,
    );
  }
  if (value === null || value === '') return null;

  const type =
    field.type === 'radio'
      ? 'select'
      : field.type === 'check'
      ? 'multiSelect'
      : field.type;
  switch (type) {
    case 'relation':
      if (!field.relation || field.relation.isInverse)
        throw new Error(`${field.name}: reverse relations are read-only`);
      return field.relation.multiple
        ? z.array(dataModelRecordIdSchema).max(100).parse(value)
        : dataModelRecordIdSchema.parse(value);
    case 'text':
    case 'textarea':
    case 'phone':
      return textSchema.parse(value);
    case 'list':
      return listSchema.parse(value);
    case 'number':
      z.union([z.number().finite(), z.string().min(1).max(100)]).parse(value);
      break;
    case 'boolean':
      z.union([z.boolean(), z.enum(['true', 'false', '1', '0'])]).parse(value);
      break;
    case 'date':
      z.union([z.string().min(1).max(100), z.date()]).parse(value);
      break;
    case 'select':
      textSchema.parse(value);
      break;
    case 'multiSelect':
      listSchema.parse(value);
      break;
  }
  if (type === 'number') {
    const number = Number(value);
    if (!Number.isFinite(number))
      throw new Error(`${field.name}: enter a finite number`);
    return number;
  }
  if (type === 'boolean')
    return value === true || value === 'true' || value === '1';
  if (type === 'date') {
    const date = value instanceof Date ? value : new Date(String(value));
    if (Number.isNaN(date.getTime()))
      throw new Error(`${field.name}: enter a valid date`);
    return date;
  }
  const allowed = new Set(
    (field.options ?? [])
      .filter((option) => !option.deprecated)
      .map((option) => option.value),
  );
  const choices = Array.isArray(value) ? value : [value];
  if (
    choices.some((choice) => typeof choice !== 'string' || !allowed.has(choice))
  )
    throw new Error(`${field.name}: value is not an option`);
  return type === 'multiSelect' ? choices : value;
};

const isEmpty = (value: unknown): boolean =>
  value === undefined ||
  value === null ||
  (typeof value === 'string' && !value.trim()) ||
  (Array.isArray(value) && value.length === 0);

export const validateDataModelRecordPatch = async (
  fields: IDataModelRecordField[],
  validator: IDataModelRecordFields['validate'],
  patch: Record<string, unknown>,
  previous: Record<string, unknown> = {},
): Promise<Record<string, unknown>> => {
  const active = fields.filter((field) => !field.archivedAt);
  const byId = new Map(active.map((field) => [field._id, field]));
  const next = { ...previous };

  for (const [fieldId, value] of Object.entries(patch)) {
    dataModelRecordIdSchema.parse(fieldId);
    const field = byId.get(fieldId);
    if (!field)
      throw new Error(`Field ${fieldId} is not an active field of this model`);
    if (field.owned)
      throw new Error(`${field.name} is managed by its feature owner`);
    const normalized = normalizeDataModelRecordValue(field, value);
    await validator(fieldId, value);
    if (normalized === null) delete next[fieldId];
    else next[fieldId] = normalized;
  }

  for (const field of active) {
    const validations = field.validations;
    const required =
      field.isRequired ||
      (typeof validations === 'object' &&
        validations !== null &&
        'required' in validations &&
        validations.required === true);
    if (field.relation?.morphId) {
      const group = active.filter(
        (entry) => entry.relation?.morphId === field.relation?.morphId,
      );
      const populated = group.filter((entry) => !isEmpty(next[entry._id]));
      if (group.length !== field.relation.morphSize)
        throw new Error(`${field.name}: relation configuration is incomplete`);
      if (required && !populated.length)
        throw new Error(`${field.name}: required`);
      if (!field.relation.multiple && populated.length > 1)
        throw new Error(
          `${field.name}: choose one record across all destination objects`,
        );
      const count = populated.reduce((total, entry) => {
        const value = next[entry._id];
        return total + (Array.isArray(value) ? value.length : 1);
      }, 0);
      if (count > 100)
        throw new Error(
          `${field.name}: a relation supports at most 100 records across its destination objects`,
        );
    } else if (required && isEmpty(next[field._id]))
      throw new Error(`${field.name}: required`);
  }
  if (Buffer.byteLength(JSON.stringify(next), 'utf8') > 512 * 1024) {
    throw new Error('Custom record values must not exceed 512 KiB');
  }
  return next;
};

export const createDataModelRecordFields = (
  connection: Connection,
  checkPermission?: (action: string) => Promise<void>,
): IDataModelRecordFields => {
  const loaded = new Map<string, IDataModelField>();
  return {
    list: async (dataModelId) => {
      const definitions = await getDataModelFieldModel(connection)
        .find({ dataModelId, archivedAt: null })
        .sort({ createdAt: 1, _id: 1 })
        .lean()
        .exec();
      return definitions.map((field): IDataModelRecordField => {
        loaded.set(field._id, field);
        return {
          _id: field._id,
          code: field.name,
          name: field.label,
          type: field.type,
          options: field.options,
          isRequired: field.required,
          owned: false,
          groupAvailable: true,
          repeating: false,
          relation: field.relation ?? undefined,
          ...(field.relation?.isInverse ? { owned: true } : {}),
        };
      });
    },
    validate: async (fieldId, value) => {
      const field = loaded.get(fieldId);
      if (field?.type !== 'relation') return;
      if (!checkPermission)
        throw new Error('Relation permission context is required');
      await new DataModelRelations(connection, checkPermission).validate(
        field,
        value,
      );
    },
  };
};
