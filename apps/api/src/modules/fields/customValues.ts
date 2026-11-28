import {
  type AppliesTo,
  logicShows,
  groupApplies,
  type PluginValuesCheck,
} from '@erxes/core-contract';
import {
  caller,
  type PropertyContentType,
  type CustomValue,
  type Db,
  fieldGroups,
  fields,
} from '@erxes/core-db';
import { and, eq, inArray, isNull, or } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { unique } from '~/lib/contacts';
import { assertMemberField, type FieldRow } from './fieldRows';

const invalid = (field: FieldRow, message: string) =>
  fail('INVALID_FIELD_VALUE', `${field.label}: ${message}`, { fieldId: field.id });

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NUMBER = /^-?\d+([.,]\d+)?$/;
const PHONE = /^\+?[\d\s().-]{3,30}$/;

const checkText = (field: FieldRow, value: CustomValue) => {
  if (typeof value !== 'string') throw invalid(field, 'expected text');

  const text = value.trim();

  if (field.validation === 'email' && !EMAIL.test(text)) throw invalid(field, 'expected an email');

  if (field.validation === 'number' && !NUMBER.test(text))
    throw invalid(field, 'expected a number');

  if (field.validation === 'date' && Number.isNaN(Date.parse(text)))
    throw invalid(field, 'expected a date');

  return text;
};

/** A value checked against its field: type, format and options. */
export const checkValue = (field: FieldRow, value: CustomValue): CustomValue => {
  switch (field.type) {
    case 'text':
    case 'textarea':
      return checkText(field, value);
    case 'phone': {
      if (typeof value !== 'string' || !PHONE.test(value.trim()) || !/\d/.test(value)) {
        throw invalid(field, 'expected a phone number');
      }

      return value.trim();
    }

    case 'number':
      if (typeof value !== 'number' || !Number.isFinite(value))
        throw invalid(field, 'expected a number');

      return value;
    case 'date':
      if (
        typeof value !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
        Number.isNaN(Date.parse(value))
      ) {
        throw invalid(field, 'expected a date (YYYY-MM-DD)');
      }

      return value;
    case 'boolean':
      if (typeof value !== 'boolean') throw invalid(field, 'expected yes or no');

      return value;
    case 'select':
    case 'radio':
      if (typeof value !== 'string' || !field.options.includes(value))
        throw invalid(field, 'not one of the options');

      return value;
    case 'multiselect':
    case 'check': {
      if (!Array.isArray(value) || value.some((item) => !field.options.includes(item))) {
        throw invalid(field, 'not among the options');
      }

      return unique(value);
    }

    case 'list': {
      if (!Array.isArray(value)) throw invalid(field, 'expected a list of text');

      return value.map((item) => item.trim()).filter(Boolean);
    }
  }
};

export const isEmpty = (value: CustomValue) =>
  value === '' || (Array.isArray(value) && !value.length);

type Definition = {
  field: FieldRow;
  groupArchivedAt: Date | null;
  groupAppliesTo: AppliesTo | null;
};

/**
 * Refuses values that leave a required field empty while it shows on the record: one the patch
 * clears, or, on `create`, one the create form asks for (`isVisibleToCreate`) and isn't given.
 */
const assertRequired = (
  definitions: Definition[],
  values: Record<string, CustomValue>,
  patch: Record<string, CustomValue | null>,
  { appliesTo, create }: { appliesTo: AppliesTo; create: boolean },
) => {
  for (const { field, groupArchivedAt, groupAppliesTo } of definitions) {
    const asked = create ? field.isVisibleToCreate : field.id in patch;

    if (
      field.isRequired &&
      asked &&
      !field.plugin &&
      !field.archivedAt &&
      !groupArchivedAt &&
      (!groupAppliesTo || groupApplies(groupAppliesTo, appliesTo)) &&
      logicShows(field.logic, values) &&
      values[field.id] === undefined
    )
      throw invalid(field, 'required');
  }
};

/**
 * Applies a custom field patch to a record's values: each key must be a field
 * of `contentType` in the organisation; empty values (`null`, `''`, `[]`) clear it.
 * Archived fields (or fields of an archived group) can only be cleared, as can those of a group
 * that doesn't apply to the record (`appliesTo`: what the record is in). A required field that
 * shows can't be cleared, and `create` needs each one its create form asks for.
 */
export const applyCustomFields = async (
  client: Db,
  contentType: PropertyContentType,
  current: Record<string, CustomValue>,
  patch: Record<string, CustomValue | null> | undefined,
  { appliesTo = {}, create = false }: { appliesTo?: AppliesTo; create?: boolean } = {},
) => {
  const ids = Object.keys(patch ?? {});

  if (!create && (!patch || !ids.length)) {
    return current;
  }

  const definitions = await client
    .select({
      field: fields,
      groupArchivedAt: fieldGroups.archivedAt,
      groupAppliesTo: fieldGroups.appliesTo,
    })
    .from(fields)
    .leftJoin(fieldGroups, eq(fieldGroups.id, fields.groupId))
    // The patched fields, and every live one a required rule or a logic rule may name.
    .where(
      and(
        eq(fields.contentType, contentType),
        or(inArray(fields.id, ids), isNull(fields.archivedAt)),
      ),
    )
    // A field can't change type or go away while a value is being checked against it.
    .for('share', { of: fields });

  const byId = new Map(definitions.map((row) => [row.field.id, row]));
  const next = { ...current };

  for (const [id, value] of Object.entries(patch ?? {})) {
    const definition = byId.get(id);

    if (!definition) {
      throw fail('INVALID_FIELD', `Unknown ${contentType} field`, { fieldId: id });
    }

    assertMemberField(definition.field);

    if (value === null || isEmpty(value)) {
      delete next[id];
      continue;
    }

    if (definition.field.archivedAt || definition.groupArchivedAt) {
      throw fail('INVALID_FIELD', `${definition.field.label} is archived`, {
        fieldId: id,
      });
    }

    if (definition.groupAppliesTo && !groupApplies(definition.groupAppliesTo, appliesTo)) {
      throw fail('INVALID_FIELD', `${definition.field.label} doesn't apply to this record`, {
        fieldId: id,
      });
    }

    const checked = checkValue(definition.field, value);

    if (isEmpty(checked)) {
      delete next[id];
    } else {
      next[id] = checked;
    }
  }

  assertRequired(definitions, next, patch ?? {}, { appliesTo, create });

  return next;
};

/**
 * `fields.check`: a plugin's record values after `patch`, for the plugin to save (it keeps the
 * values of its own record types; core stores nothing).
 */
export const checkPluginValues = async (client: Db, input: PluginValuesCheck) => {
  const { plugin } = caller('plugin');

  if (!input.contentType.startsWith(`${plugin}.`))
    throw fail('NOT_ALLOWED', 'A plugin checks values of its own record types only');

  return {
    values: await applyCustomFields(client, input.contentType, input.current, input.patch, {
      appliesTo: input.appliesTo,
      create: input.create,
    }),
  };
};
