import { DATA_EXTENSIONS_NAMESPACE } from './constants';
import { IDataExtensionField, IDataExtensionRecordType } from './types';
import {
  DataExtensionValidationError,
  normalizeDataExtensionValue,
} from './validation';

/** Operators a view filter can use; each type accepts a subset. */
export const DATA_EXTENSION_FILTER_OPERATORS = [
  'eq',
  'neq',
  'contains',
  'notContains',
  'gt',
  'gte',
  'lt',
  'lte',
  'in',
  'nin',
  'isEmpty',
  'isNotEmpty',
] as const;

export type DataExtensionFilterOperator =
  (typeof DATA_EXTENSION_FILTER_OPERATORS)[number];

export interface IDataExtensionFilterCondition {
  /** A field key, or `name`, `createdAt`, `updatedAt` on custom objects. */
  field: string;
  operator: DataExtensionFilterOperator;
  value?: unknown;
}

export interface IDataExtensionFilter {
  match?: 'all' | 'any';
  conditions?: IDataExtensionFilterCondition[];
}

export const DATA_EXTENSION_QUERY_LIMITS = {
  conditions: 20,
  inValues: 100,
  groups: 200,
  metrics: 10,
} as const;

const fail = (message: string): never => {
  throw new DataExtensionValidationError(message);
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');


/** Operators each field type supports, beyond isEmpty / isNotEmpty. */
const operatorsFor = (field: IDataExtensionField): DataExtensionFilterOperator[] => {
  if (field.relation) {
    return ['eq', 'neq', 'in', 'nin'];
  }

  switch (field.type) {
    case 'text':
    case 'longText':
    case 'email':
    case 'url':
    case 'phone':
      return ['eq', 'neq', 'contains', 'notContains'];
    case 'number':
    case 'percent':
    case 'rating':
    case 'currency':
    case 'date':
    case 'dateTime':
      return ['eq', 'neq', 'gt', 'gte', 'lt', 'lte'];
    case 'boolean':
      return ['eq', 'neq'];
    case 'select':
    case 'multiSelect':
    case 'member':
      return ['eq', 'neq', 'in', 'nin'];
    case 'address':
    case 'fullName':
    case 'links':
    case 'emails':
    case 'phones':
    case 'files':
      return ['contains', 'notContains'];
    default:
      return [];
  }
};

/** Native fields every custom object record can be filtered on. */
const NATIVE_FILTER_FIELDS: Record<string, IDataExtensionField> = {
  name: { key: 'name', label: 'Name', type: 'text' } as IDataExtensionField,
  createdAt: {
    key: 'createdAt',
    label: 'Created',
    type: 'dateTime',
  } as IDataExtensionField,
  updatedAt: {
    key: 'updatedAt',
    label: 'Updated',
    type: 'dateTime',
  } as IDataExtensionField,
};

const pathOf = (field: IDataExtensionField, native: boolean) =>
  native ? field.key : `${DATA_EXTENSIONS_NAMESPACE}.${field.key}`;

/** A value checked like a stored one, without the field's write settings. */
const comparable = (field: IDataExtensionField, value: unknown) => {
  const loose = { ...field, settings: { ...field.settings, min: undefined, max: undefined, maxLength: undefined } };

  if (field.type === 'currency') {
    return typeof value === 'number' && Number.isFinite(value)
      ? value
      : fail(`${field.key} compares against an amount`);
  }

  if (field.relation || field.type === 'member') {
    return typeof value === 'string' && value && value.length <= 64
      ? value
      : fail(`${field.key} compares against a record id`);
  }

  if (field.type === 'multiSelect') {
    return normalizeDataExtensionValue({ ...loose, type: 'select' }, value);
  }

  return normalizeDataExtensionValue(loose, value);
};

const textPattern = (field: IDataExtensionField, value: unknown) => {
  if (typeof value !== 'string' || !value.trim()) {
    return fail(`${field.key} needs text to search for`);
  }

  if (value.length > 100) {
    return fail(`${field.key} search text is limited to 100 characters`);
  }

  return new RegExp(escapeRegExp(value.trim()), 'i');
};

/** Paths a "contains" on a composite value looks in. */
const containsPaths = (field: IDataExtensionField, path: string) => {
  switch (field.type) {
    case 'address':
      return ['street', 'street2', 'city', 'state', 'postalCode', 'country'].map(
        (part) => `${path}.${part}`,
      );
    case 'fullName':
      return [`${path}.firstName`, `${path}.lastName`];
    case 'links':
      return [`${path}.url`, `${path}.label`];
    case 'files':
      return [`${path}.name`];
    default:
      return [path];
  }
};

const emptyCondition = (path: string, empty: boolean) =>
  empty
    ? { $or: [{ [path]: { $exists: false } }, { [path]: null }, { [path]: '' }, { [path]: { $size: 0 } }] }
    : { [path]: { $exists: true, $nin: [null, ''], $not: { $size: 0 } } };

const conditionFilter = (
  field: IDataExtensionField,
  native: boolean,
  condition: IDataExtensionFilterCondition,
): Record<string, unknown> => {
  const base = pathOf(field, native);
  const path = field.type === 'currency' ? `${base}.amount` : base;
  const { operator, value } = condition;

  if (operator === 'isEmpty' || operator === 'isNotEmpty') {
    return emptyCondition(base, operator === 'isEmpty');
  }

  if (!operatorsFor(field).includes(operator)) {
    return fail(`${field.key} cannot be filtered with "${operator}"`);
  }

  switch (operator) {
    case 'contains':
    case 'notContains': {
      const pattern = textPattern(field, value);
      const match = { $or: containsPaths(field, base).map((p) => ({ [p]: pattern })) };

      return operator === 'contains' ? match : { $nor: [match] };
    }
    case 'eq':
      return { [path]: comparable(field, value) };
    case 'neq':
      return { [path]: { $ne: comparable(field, value) } };
    case 'gt':
    case 'gte':
    case 'lt':
    case 'lte':
      return { [path]: { [`$${operator}`]: comparable(field, value) } };
    case 'in':
    case 'nin': {
      if (!Array.isArray(value) || !value.length) {
        return fail(`${field.key} needs a list of values`);
      }

      if (value.length > DATA_EXTENSION_QUERY_LIMITS.inValues) {
        return fail(`${field.key} accepts at most ${DATA_EXTENSION_QUERY_LIMITS.inValues} values`);
      }

      const values = value.map((item) => comparable(field, item));

      return { [path]: { [operator === 'in' ? '$in' : '$nin']: values } };
    }
    default:
      return fail(`Unknown operator "${operator}"`);
  }
};

/**
 * Turns a view's filter into a Mongo filter on active fields only. Every
 * operator is checked against the field type and every value is
 * normalised like a stored one, so a client cannot inject operators,
 * regexes or paths of its own.
 */
export const buildDataExtensionRecordFilter = (
  descriptor: IDataExtensionRecordType,
  activeFields: IDataExtensionField[],
  filter?: IDataExtensionFilter | null,
): Record<string, unknown> => {
  const conditions = filter?.conditions || [];

  if (!conditions.length) {
    return {};
  }

  if (conditions.length > DATA_EXTENSION_QUERY_LIMITS.conditions) {
    return fail(
      `A filter has at most ${DATA_EXTENSION_QUERY_LIMITS.conditions} conditions`,
    );
  }

  const byKey = new Map(activeFields.map((field) => [field.key, field]));
  const parts = conditions.map((condition) => {
    if (!condition || typeof condition.field !== 'string') {
      return fail('Each condition names a field');
    }

    const nativeField = descriptor.custom
      ? NATIVE_FILTER_FIELDS[condition.field]
      : undefined;
    const field = nativeField || byKey.get(condition.field);

    if (!field) {
      return fail(`Unknown field "${condition.field}"`);
    }

    if (field.relation && field.relation.side !== 'source') {
      return fail(`${field.key} is filtered from the other record type`);
    }

    if (!(DATA_EXTENSION_FILTER_OPERATORS as readonly string[]).includes(condition.operator)) {
      return fail(`Unknown operator "${String(condition.operator)}"`);
    }

    return conditionFilter(field, Boolean(nativeField), condition);
  });

  return filter?.match === 'any' ? { $or: parts } : { $and: parts };
};

export const DATA_EXTENSION_AGGREGATE_OPS = ['count', 'sum', 'avg', 'min', 'max'] as const;

export type DataExtensionAggregateOp = (typeof DATA_EXTENSION_AGGREGATE_OPS)[number];

export interface IDataExtensionMetric {
  field?: string;
  op: DataExtensionAggregateOp;
}

const NUMERIC_TYPES = ['number', 'percent', 'rating', 'currency'];

/** Types a board or chart can group by: one value per record. */
const GROUPABLE_TYPES = ['select', 'boolean', 'rating', 'member'];

export const isGroupableDataExtensionField = (field: IDataExtensionField) =>
  field.relation
    ? field.relation.side === 'source' && field.relation.kind !== 'manyToMany'
    : GROUPABLE_TYPES.includes(field.type) && !(field.type === 'member' && field.settings?.multiple);

/**
 * Pipeline stages for grouped totals: the group key and each metric, on
 * active numeric fields only.
 */
export const buildDataExtensionAggregateStages = (
  activeFields: IDataExtensionField[],
  groupBy: string | undefined,
  metrics: IDataExtensionMetric[],
) => {
  if (metrics.length > DATA_EXTENSION_QUERY_LIMITS.metrics) {
    fail(`At most ${DATA_EXTENSION_QUERY_LIMITS.metrics} totals at once`);
  }

  const byKey = new Map(activeFields.map((field) => [field.key, field]));
  let groupPath: string | null = null;

  if (groupBy) {
    const field = byKey.get(groupBy);

    if (!field || !isGroupableDataExtensionField(field)) {
      fail(`"${groupBy}" cannot be used to group records`);
    }

    groupPath = `$${DATA_EXTENSIONS_NAMESPACE}.${groupBy}`;
  }

  const group: Record<string, unknown> = {
    _id: groupPath === null ? null : { $ifNull: [groupPath, null] },
    count: { $sum: 1 },
  };

  metrics.forEach((metric, index) => {
    if (!(DATA_EXTENSION_AGGREGATE_OPS as readonly string[]).includes(metric.op)) {
      fail(`Unknown total "${String(metric.op)}"`);
    }

    if (metric.op === 'count') {
      return;
    }

    const field = metric.field ? byKey.get(metric.field) : undefined;

    if (!field || !NUMERIC_TYPES.includes(field.type)) {
      fail(`${metric.op} needs a number, currency, percent or rating field`);
      return;
    }

    const path = `$${DATA_EXTENSIONS_NAMESPACE}.${field.key}${field.type === 'currency' ? '.amount' : ''}`;

    group[`m${index}`] = { [`$${metric.op}`]: path };
  });

  return [
    { $group: group },
    { $sort: { count: -1 as const } },
    { $limit: DATA_EXTENSION_QUERY_LIMITS.groups },
  ];
};

