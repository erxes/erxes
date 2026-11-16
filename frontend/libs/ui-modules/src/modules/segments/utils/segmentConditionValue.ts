import { gql } from '@apollo/client';
import { TPropertyInputMeta } from 'erxes-ui';
import { TSegmentField, TSegmentOperator } from '../types';

type TListVariables = Record<string, string | boolean>;

export type TSegmentValueInputKind =
  | 'none'
  | 'number'
  | 'custom'
  | 'date'
  | 'static'
  | 'query'
  | 'text';

// A field's own variables are declared with the GraphQL type of their value
const extraArgs = (variables: TListVariables = {}) => {
  const keys = Object.keys(variables);
  const graphqlType = (key: string) =>
    typeof variables[key] === 'boolean' ? 'Boolean' : 'String';

  return {
    declared: keys.map((key) => `, $${key}: ${graphqlType(key)}`).join(''),
    passed: keys.map((key) => `, ${key}: $${key}`).join(''),
  };
};

export const segmentValueListQuery = (
  name: string,
  labelField: string,
  valueField: string,
  variables?: TListVariables,
) => {
  const { declared, passed } = extraArgs(variables);

  return gql`
  query ${name}($searchValue: String, $direction: CURSOR_DIRECTION, $cursor: String, $limit: Int${declared}) {
    ${name}(searchValue: $searchValue, direction: $direction, cursor: $cursor, limit: $limit${passed}) {
      list { ${labelField} ${valueField} }
      totalCount
      pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
    }
  }
`;
};

export const onlyStringMeta = (
  meta: TPropertyInputMeta,
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(meta).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string',
    ),
  );

export const segmentDateValue = (value: unknown): Date | undefined => {
  if (value instanceof Date) {
    return value;
  }

  return typeof value === 'string' && value ? new Date(value) : undefined;
};

export const segmentTextValue = (value: unknown) =>
  typeof value === 'string' ? value : '';

/** Which input a condition's value takes, in the order they are preferred. */
export const segmentValueInputKind = (
  field: TSegmentField,
  operator: TSegmentOperator,
  hasCustomInput: boolean,
): TSegmentValueInputKind => {
  if (operator.input === 'none') {
    return 'none';
  }

  if (operator.input === 'number') {
    return 'number';
  }

  if (hasCustomInput) {
    return 'custom';
  }

  if (field.input === 'date') {
    return 'date';
  }

  if (field.input === 'select' && field.source === 'static') {
    return 'static';
  }

  if (field.input === 'select' && field.query) {
    return 'query';
  }

  return 'text';
};
