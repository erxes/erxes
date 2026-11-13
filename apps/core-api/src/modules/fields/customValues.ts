import {
  type FieldContentType,
  type CustomValue,
  type Db,
  fieldGroups,
  fields,
} from '@erxes/core-db';
import { and, eq, inArray } from 'drizzle-orm';
import { HttpError } from '~/http/errors';
import { unique } from '~/lib/contacts';
import type { FieldRow } from './fieldRows';

const invalid = (field: FieldRow, message: string) =>
  new HttpError(400, 'INVALID_FIELD_VALUE', `${field.label}: ${message}`, { fieldId: field.id });

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
const checkValue = (field: FieldRow, value: CustomValue): CustomValue => {
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

const isEmpty = (value: CustomValue) => value === '' || (Array.isArray(value) && !value.length);

/**
 * Applies a custom field patch to a record's values: each key must be a field
 * of `contentType` in the organisation; empty values (`null`, `''`, `[]`) clear it.
 * Archived fields (or fields of an archived group) can only be cleared.
 */
export const applyCustomFields = async (
  client: Db,
  orgId: string,
  contentType: FieldContentType,
  current: Record<string, CustomValue>,
  patch: Record<string, CustomValue | null> | undefined,
) => {
  const ids = Object.keys(patch ?? {});

  if (!patch || !ids.length) {
    return current;
  }

  const definitions = await client
    .select({ field: fields, groupArchivedAt: fieldGroups.archivedAt })
    .from(fields)
    .leftJoin(fieldGroups, eq(fieldGroups.id, fields.groupId))
    .where(
      and(eq(fields.orgId, orgId), eq(fields.contentType, contentType), inArray(fields.id, ids)),
    )
    // A field can't change type or go away while a value is being checked against it.
    .for('share', { of: fields });

  const byId = new Map(definitions.map((row) => [row.field.id, row]));
  const next = { ...current };

  for (const [id, value] of Object.entries(patch)) {
    const definition = byId.get(id);

    if (!definition) {
      throw new HttpError(400, 'INVALID_FIELD', `Unknown ${contentType} field`, { fieldId: id });
    }

    if (value === null || isEmpty(value)) {
      delete next[id];
      continue;
    }

    if (definition.field.archivedAt || definition.groupArchivedAt) {
      throw new HttpError(400, 'INVALID_FIELD', `${definition.field.label} is archived`, {
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

  return next;
};
