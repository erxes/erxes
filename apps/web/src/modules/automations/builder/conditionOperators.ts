import { CONDITION_OPERATORS, type ConditionGroup, type ConditionRule } from '@erxes/core-contract';

type Operator = (typeof CONDITION_OPERATORS)[number];

export const OPERATOR_LABELS: Record<Operator, string> = {
  eq: 'is',
  neq: 'is not',
  gt: 'is greater than',
  gte: 'is at least',
  lt: 'is less than',
  lte: 'is at most',
  contains: 'contains',
  not_contains: "doesn't contain",
  starts_with: 'starts with',
  in: 'is one of',
  not_in: 'is none of',
  exists: 'is set',
  not_exists: 'is empty',
  within_last: 'in the last',
  more_than_ago: 'more than … ago',
  within_next: 'in the next',
  anniversary_within: 'anniversary in the next',
};

/** Operators that make sense for a field's type. */
export const operatorsFor = (type: string | undefined) => {
  if (type === 'date') {
    return [
      'within_last',
      'more_than_ago',
      'within_next',
      'anniversary_within',
      'eq',
      'gt',
      'lt',
      'exists',
      'not_exists',
    ] as const;
  }

  if (type === 'number')
    return ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'exists', 'not_exists'] as const;

  if (type === 'tags' || type === 'list')
    return ['contains', 'not_contains', 'exists', 'not_exists'] as const;

  if (type === 'boolean') return ['eq', 'neq'] as const;

  if (type === 'select' || type === 'member')
    return ['eq', 'neq', 'in', 'not_in', 'exists', 'not_exists'] as const;

  return CONDITION_OPERATORS;
};

export const NO_VALUE = new Set<string>(['exists', 'not_exists']);

export const RELATIVE = new Set<string>([
  'within_last',
  'more_than_ago',
  'within_next',
  'anniversary_within',
]);

export const LIST_VALUE = new Set<string>(['in', 'not_in']);

export const isRule = (rule: ConditionRule | ConditionGroup): rule is ConditionRule =>
  !('match' in rule);

/** A relative date takes `{ amount, unit }`; switching to or from one resets the value. */
export const withOperator = (rule: ConditionRule, op: Operator): ConditionRule => {
  if (RELATIVE.has(op) === RELATIVE.has(rule.op)) return { ...rule, op };

  return { ...rule, op, value: RELATIVE.has(op) ? { amount: 30, unit: 'days' } : undefined };
};
