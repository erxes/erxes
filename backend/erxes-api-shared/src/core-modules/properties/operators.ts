import { escapeRegExp } from '../../utils';
import { PropertyFilterQuery, PropertyFilterOperator } from './types';

const isEmpty = (value: unknown) =>
  value === undefined || value === null || value === '';

const toArray = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : isEmpty(value) ? [] : [value];

const regex = (value: string) => ({
  $regex: escapeRegExp(value),
  $options: 'i',
});

const fileTypes = (value: unknown): string[] =>
  toArray(value)
    .map((item) => String(item ?? '').trim())
    .filter(Boolean);

const asNumberOrString = (value: unknown): number | string => {
  const text = String(value ?? '');

  return text !== '' && !isNaN(Number(text)) ? Number(text) : text;
};

const eqValues = (value: unknown): unknown[] => {
  const normalized = asNumberOrString(value);

  return typeof normalized === 'number'
    ? [normalized, String(value)]
    : [normalized];
};

export const PROPERTY_FILTER_OPERATORS: Record<
  PropertyFilterOperator,
  (path: string, value: unknown) => PropertyFilterQuery | null
> = {
  eq: (path, value) => ({ [path]: { $in: eqValues(value) } }),
  ne: (path, value) => ({ [path]: { $nin: eqValues(value) } }),
  gt: (path, value) => ({ [path]: { $gt: asNumberOrString(value) } }),
  gte: (path, value) => ({ [path]: { $gte: asNumberOrString(value) } }),
  lt: (path, value) => ({ [path]: { $lt: asNumberOrString(value) } }),
  lte: (path, value) => ({ [path]: { $lte: asNumberOrString(value) } }),
  isTrue: (path) => ({ [path]: { $in: [true, 'true', 'Yes', 'yes'] } }),
  isFalse: (path) => ({ [path]: { $in: [false, 'false', 'No', 'no', null] } }),
  isSet: (path) => ({ [path]: { $exists: true, $nin: [null, '', []] } }),
  isNotSet: (path) => ({
    $or: [{ [path]: { $exists: false } }, { [path]: { $in: [null, ''] } }],
  }),
  contains: (path, value) =>
    isEmpty(value) ? null : { [path]: regex(String(value)) },
  doesNotContain: (path, value) =>
    isEmpty(value) ? null : { [path]: { $not: regex(String(value)) } },
  in: (path, value) =>
    toArray(value).length ? { [path]: { $in: toArray(value) } } : null,
  notIn: (path, value) =>
    toArray(value).length ? { [path]: { $nin: toArray(value) } } : null,
  fileType: (path, value) => {
    const types = fileTypes(value);

    return types.length
      ? {
          [`${path}.type`]: {
            $regex: types.map(escapeRegExp).join('|'),
            $options: 'i',
          },
        }
      : null;
  },
};

export const PROPERTY_FILTER_OPERATOR_BY_TYPE: Record<
  string,
  PropertyFilterOperator
> = {
  boolean: 'isTrue',
  number: 'eq',
  date: 'eq',
  multiSelect: 'in',
  check: 'in',
};

export const isPropertyFilterOperator = (
  operator: string,
): operator is PropertyFilterOperator => operator in PROPERTY_FILTER_OPERATORS;

export const MULTI_VALUE_PROPERTY_OPERATORS: PropertyFilterOperator[] = [
  'in',
  'notIn',
  'fileType',
];
