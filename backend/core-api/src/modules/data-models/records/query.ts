import { escapeRegExp } from 'lodash';
import { z } from 'zod';
import { normalizeDataModelRecordValue } from './fields';
import type { IDataModelRecordField, IDataModelRecordQuery } from './types';
import { dataModelRecordListSchema } from './validation';

const activeField = (
  fields: IDataModelRecordField[],
  id: string,
): IDataModelRecordField => {
  const field = fields.find((entry) => entry._id === id && !entry.archivedAt);
  if (!field || !field.groupAvailable || field.repeating) {
    throw new Error(
      `Field ${id} is not an active, non-repeating field of this model`,
    );
  }
  if (field.relation?.isInverse)
    throw new Error(
      'Reverse relations cannot be filtered or sorted as stored values',
    );
  return field;
};

export const buildDataModelRecordQuery = (
  fields: IDataModelRecordField[],
  input: unknown,
): IDataModelRecordQuery => {
  const params = dataModelRecordListSchema.parse(input);
  const conditions: Record<string, unknown>[] = [];
  if (params.recordId) conditions.push({ _id: params.recordId });
  for (const filter of params.filters) {
    const field = activeField(fields, filter.fieldId);
    const path = `propertiesData.${field._id}`;
    const { operator, value } = filter;
    if (operator === 'IS_EMPTY' || operator === 'IS_NOT_EMPTY') {
      const empty = {
        $or: [{ [path]: null }, { [path]: '' }, { [path]: { $size: 0 } }],
      };
      conditions.push(operator === 'IS_EMPTY' ? empty : { $nor: [empty] });
    } else if (operator === 'CONTAINS') {
      if (!['text', 'textarea', 'phone'].includes(field.type)) {
        throw new Error(`${field.name}: CONTAINS requires a text field`);
      }
      const text = z.string().min(1).max(200).parse(value);
      conditions.push({
        [path]: { $regex: escapeRegExp(text), $options: 'i' },
      });
    } else if (operator === 'IN') {
      const items = z.array(z.unknown()).min(1).max(100).parse(value);
      const itemField = {
        ...field,
        ...(field.relation
          ? { relation: { ...field.relation, multiple: false } }
          : {}),
        type: ['multiSelect', 'check'].includes(field.type)
          ? 'select'
          : field.type === 'list'
          ? 'text'
          : field.type,
      };
      const values = items.map((item) =>
        normalizeDataModelRecordValue(itemField, item),
      );
      conditions.push({ [path]: { $in: values } });
    } else {
      const range = ['GT', 'GTE', 'LT', 'LTE'].includes(operator);
      if (range && !['number', 'date'].includes(field.type)) {
        throw new Error(
          `${field.name}: range filters require a number or date`,
        );
      }
      const normalized = normalizeDataModelRecordValue(field, value);
      if (range && normalized === null)
        throw new Error('A range filter requires a value');
      conditions.push({
        [path]: { [`$${operator.toLowerCase()}`]: normalized },
      });
    }
  }

  if (Buffer.byteLength(JSON.stringify(conditions), 'utf8') > 128 * 1024) {
    throw new Error('Record filters must not exceed 128 KiB');
  }
  const direction = params.sort?.direction === 'ASC' ? 1 : -1;
  let sortPath = params.sort?.field ?? 'createdAt';
  if (!['_id', 'createdAt', 'updatedAt'].includes(sortPath)) {
    const field = activeField(fields, sortPath);
    if (
      ![
        'text',
        'textarea',
        'phone',
        'number',
        'boolean',
        'date',
        'select',
        'radio',
      ].includes(field.type)
    ) {
      throw new Error(`${field.name}: sorting requires a scalar field`);
    }
    sortPath = `propertiesData.${field._id}`;
  }
  return {
    filter: conditions.length ? { $and: conditions } : {},
    sort: { [sortPath]: direction, _id: direction },
    limit: params.limit,
    offset: params.offset,
    deleted: params.deleted,
  };
};
