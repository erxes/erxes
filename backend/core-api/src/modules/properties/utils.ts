import { escapeRegExp } from 'erxes-api-shared/utils';

export type PropertyFilterOperator =
  | 'eq'
  | 'ne'
  | 'contains'
  | 'doesNotContain'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'isTrue'
  | 'isFalse'
  | 'in'
  | 'notIn'
  | 'isSet'
  | 'isNotSet'
  | 'fileType';

export interface IPropertyFilterCondition {
  fieldId: string;
  type?: string;
  operator?: PropertyFilterOperator;
  value?: any;
}

const isEmpty = (value: any) =>
  value === undefined || value === null || value === '';

const toArray = (value: any): any[] =>
  Array.isArray(value) ? value : isEmpty(value) ? [] : [value];

const regex = (value: string) => ({
  $regex: escapeRegExp(value),
  $options: 'i',
});

const fileTypes = (value: any): string[] =>
  toArray(value)
    .map((v) => String(v ?? '').trim())
    .filter(Boolean);

const asNumberOrString = (v: any): number | string => {
  const s = String(v ?? '');
  return s !== '' && !isNaN(Number(s)) ? Number(s) : s;
};

const eqValues = (v: any): any[] => {
  const n = asNumberOrString(v);
  return typeof n === 'number' ? [n, String(v)] : [n];
};

const PROPERTY_OPERATORS: Record<
  PropertyFilterOperator,
  (p: string, value: any) => Record<string, any> | null
> = {
  eq: (p, v) => ({ [p]: { $in: eqValues(v) } }),
  ne: (p, v) => ({ [p]: { $nin: eqValues(v) } }),
  gt: (p, v) => ({ [p]: { $gt: asNumberOrString(v) } }),
  gte: (p, v) => ({ [p]: { $gte: asNumberOrString(v) } }),
  lt: (p, v) => ({ [p]: { $lt: asNumberOrString(v) } }),
  lte: (p, v) => ({ [p]: { $lte: asNumberOrString(v) } }),
  isTrue: (p) => ({ [p]: { $in: [true, 'true', 'Yes', 'yes'] } }),
  isFalse: (p) => ({ [p]: { $in: [false, 'false', 'No', 'no', null] } }),
  isSet: (p) => ({ [p]: { $exists: true, $nin: [null, '', []] } }),
  isNotSet: (p) => ({
    $or: [{ [p]: { $exists: false } }, { [p]: { $in: [null, ''] } }],
  }),
  contains: (p, v) => (isEmpty(v) ? null : { [p]: regex(String(v)) }),
  doesNotContain: (p, v) =>
    isEmpty(v) ? null : { [p]: { $not: regex(String(v)) } },
  in: (p, v) => (toArray(v).length ? { [p]: { $in: toArray(v) } } : null),
  notIn: (p, v) => (toArray(v).length ? { [p]: { $nin: toArray(v) } } : null),
  fileType: (p, v) =>
    fileTypes(v).length
      ? {
          [`${p}.type`]: {
            $regex: fileTypes(v).map(escapeRegExp).join('|'),
            $options: 'i',
          },
        }
      : null,
};

const PROPERTY_OPERATOR_BY_TYPE: Record<string, PropertyFilterOperator> = {
  boolean: 'isTrue',
  number: 'eq',
  date: 'eq',
  multiSelect: 'in',
  check: 'in',
};

const CONDITION_SEP = ';';
const PART_SEP = ':';
const VALUE_SEP = ',';

const MULTI_OPERATORS: PropertyFilterOperator[] = ['in', 'notIn', 'fileType'];

const decodeConditionValue = (
  operator: PropertyFilterOperator,
  raw: string,
): any => {
  if (MULTI_OPERATORS.includes(operator)) {
    return raw
      .split(VALUE_SEP)
      .filter(Boolean)
      .map((v) => decodeURIComponent(v));
  }
  return decodeURIComponent(raw);
};

export const parsePropertyConditions = (
  propertiesData: string,
): IPropertyFilterCondition[] => {
  return String(propertiesData)
    .split(CONDITION_SEP)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce<IPropertyFilterCondition[]>((conditions, entry) => {
      const firstSep = entry.indexOf(PART_SEP);
      if (firstSep === -1) {
        return conditions;
      }
      const fieldId = decodeURIComponent(entry.slice(0, firstSep));

      const rest = entry.slice(firstSep + 1);
      const secondSep = rest.indexOf(PART_SEP);

      const operator = (
        secondSep === -1 ? rest : rest.slice(0, secondSep)
      ) as PropertyFilterOperator;

      if (!fieldId || !operator) {
        return conditions;
      }

      const condition: IPropertyFilterCondition = { fieldId, operator };

      if (secondSep !== -1) {
        condition.value = decodeConditionValue(
          operator,
          rest.slice(secondSep + 1),
        );
      }

      conditions.push(condition);
      return conditions;
    }, []);
};

export const withPropertyConditions = (
  propertiesData: string,
): Record<string, any>[] => {
  if (!propertiesData) {
    return [];
  }

  const conditions = parsePropertyConditions(propertiesData);

  return conditions.reduce<Record<string, any>[]>((properties, condition) => {
    const { fieldId, value, type = '' } = condition || {};

    if (!condition || !fieldId) {
      return properties;
    }

    const operator =
      condition?.operator || PROPERTY_OPERATOR_BY_TYPE[type] || 'contains';

    const property = PROPERTY_OPERATORS[operator]?.(
      `propertiesData.${fieldId}`,
      value,
    );

    if (property) {
      properties.push(property);
    }

    return properties;
  }, []);
};
