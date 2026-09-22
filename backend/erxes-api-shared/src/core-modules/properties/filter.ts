import {
  parsePropertyDataKey,
  propertyDataPath,
  toPropertyGroupKey,
} from './keys';
import { mergePropertyRowConditions } from './mergeRows';
import {
  isPropertyFilterOperator,
  MULTI_VALUE_PROPERTY_OPERATORS,
  PROPERTY_FILTER_OPERATOR_BY_TYPE,
  PROPERTY_FILTER_OPERATORS,
} from './operators';
import {
  IPropertyFilterCondition,
  IPropertyFilterOptions,
  PropertyFilterQuery,
  PropertyFilterOperator,
} from './types';

// `fieldId:operator:value`, joined by `;`. Every segment is percent-encoded, so
// a compound `g:<groupId>/<fieldId>` key survives the round trip.
const CONDITION_SEP = ';';
const PART_SEP = ':';
const VALUE_SEP = ',';

const decodeConditionValue = (
  operator: PropertyFilterOperator,
  raw: string,
): unknown => {
  if (MULTI_VALUE_PROPERTY_OPERATORS.includes(operator)) {
    return raw
      .split(VALUE_SEP)
      .filter(Boolean)
      .map((value) => decodeURIComponent(value));
  }

  return decodeURIComponent(raw);
};

export const parsePropertyFilterConditions = (
  encoded?: string | null,
): IPropertyFilterCondition[] => {
  if (!encoded) {
    return [];
  }

  return String(encoded)
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
      const rawOperator = secondSep === -1 ? rest : rest.slice(0, secondSep);

      if (!fieldId || !isPropertyFilterOperator(rawOperator)) {
        return conditions;
      }

      const condition: IPropertyFilterCondition = {
        fieldId,
        operator: rawOperator,
      };

      if (secondSep !== -1) {
        condition.value = decodeConditionValue(
          rawOperator,
          rest.slice(secondSep + 1),
        );
      }

      conditions.push(condition);

      return conditions;
    }, []);
};

export const buildPropertyFilterConditions = (
  conditions: IPropertyFilterCondition[],
  options?: IPropertyFilterOptions,
): PropertyFilterQuery[] => {
  const { prefix } = options || {};

  const built: PropertyFilterQuery[] = [];
  const standalone = new Set<PropertyFilterQuery>();

  for (const condition of conditions || []) {
    const { fieldId, value, type = '' } = condition || {};

    if (!condition || !fieldId) {
      continue;
    }

    const operator =
      condition.operator ||
      PROPERTY_FILTER_OPERATOR_BY_TYPE[type] ||
      'contains';

    const build = PROPERTY_FILTER_OPERATORS[operator];

    if (!build) {
      continue;
    }

    const key = parsePropertyDataKey(fieldId);

    if (key.kind === 'row') {
      const inner = build(key.fieldId, value);

      if (inner) {
        const property = {
          [propertyDataPath(toPropertyGroupKey(key.groupId), prefix)]: {
            $elemMatch: inner,
          },
        };

        if (key.anyRow) {
          standalone.add(property);
        }

        built.push(property);
      }

      continue;
    }

    const property = build(propertyDataPath(key.fieldId, prefix), value);

    if (property) {
      built.push(property);
    }
  }

  return mergePropertyRowConditions(
    built,
    (property) => !standalone.has(property),
  );
};

export const buildPropertyFilter = (
  input?: string | IPropertyFilterCondition[] | null,
  options?: IPropertyFilterOptions,
): PropertyFilterQuery[] =>
  buildPropertyFilterConditions(
    typeof input === 'string' || input == null
      ? parsePropertyFilterConditions(input)
      : input,
    options,
  );
