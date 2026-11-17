import {
  isRule,
  LIST_VALUE,
  NO_VALUE,
  RELATIVE,
  RelativeAmount,
  type TConditionField,
  type TConditionGroup,
  type TConditionOperator,
  type TConditionRule,
} from './conditions';

/*
 * Rules as the filter and condition editors edit them. Only those editors import this: they load
 * on first use, and erxes-ui's main chunk, which every route loads, stays without it.
 */

/**
 * "Between" isn't an operator of core's: it is a group of "at least" and "at most" on one field,
 * which every reader of conditions (core's lists, automations, a plugin's API) already takes.
 * The editors show such a group as one rule.
 */
export type TBetween = TConditionGroup & {
  match: 'all';
  rules: [TConditionRule & { op: 'gte' }, TConditionRule & { op: 'lte' }];
};

const isBetween = (node: TConditionRule | TConditionGroup): node is TBetween => {
  if (isRule(node) || node.match !== 'all' || node.rules.length !== 2) return false;

  const [from, to] = node.rules;

  return (
    !!from &&
    !!to &&
    isRule(from) &&
    isRule(to) &&
    from.op === 'gte' &&
    to.op === 'lte' &&
    from.path === to.path
  );
};

/** A rule as the editors show one: a rule, or a "between" group. */
export type TFilterRule = TConditionRule | TBetween;

/** The operators the editors offer: core's, and "between". */
export type TFilterOperator = TConditionOperator | 'between';

export const isFilterRule = (node: TConditionRule | TConditionGroup): node is TFilterRule =>
  isRule(node) || isBetween(node);

export const pathOf = (rule: TFilterRule) => (isRule(rule) ? rule.path : rule.rules[0].path);

export const opOf = (rule: TFilterRule): TFilterOperator => (isRule(rule) ? rule.op : 'between');

export const between = (path: string, from: unknown, to: unknown): TBetween => ({
  match: 'all',
  rules: [
    { path, op: 'gte', value: from },
    { path, op: 'lte', value: to },
  ],
});

/**
 * A relation's measures always have a value (no records count 0), and a rule on one carries its
 * `where`, which a "between" would split in two: comparisons only.
 */
const RELATION_OPERATORS: Record<string, readonly TFilterOperator[]> = {
  number: ['gte', 'gt', 'eq', 'neq', 'lt', 'lte'],
  date: ['within_last', 'more_than_ago', 'within_next', 'eq', 'lt', 'gt'],
};

/** The operators that fit a field, by its type, in the order the menus list them. */
export const operatorsFor = (
  field: Pick<TConditionField, 'type' | 'relation'> | undefined,
): readonly TFilterOperator[] => {
  const type = field?.type;
  const related = field?.relation && type ? RELATION_OPERATORS[type] : undefined;

  if (related) return related;

  switch (type) {
    case 'date':
      return [
        'within_last',
        'within_next',
        'more_than_ago',
        'eq',
        'lt',
        'gt',
        'between',
        'anniversary_within',
        'exists',
        'not_exists',
      ];

    case 'number':
      return ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between', 'exists', 'not_exists'];

    case 'select':
    case 'member':
    case 'tags':
    case 'customer':
    case 'company':
    case 'product':
      return ['in', 'not_in', 'exists', 'not_exists'];

    case 'list':
      return ['contains', 'not_contains', 'exists', 'not_exists'];

    case 'boolean':
      return ['eq'];

    default:
      return ['contains', 'not_contains', 'eq', 'neq', 'starts_with', 'exists', 'not_exists'];
  }
};

/** A new rule on `field`: its type's first operator, no value yet. */
export const ruleFor = (
  field: Pick<TConditionField, 'path' | 'type' | 'relation'>,
): TFilterRule => {
  const op = operatorsFor(field)[0] ?? 'eq';

  if (op === 'between') return between(field.path, undefined, undefined);

  if (op === 'within_last') return { path: field.path, op, value: { amount: 30, unit: 'days' } };

  return { path: field.path, op, value: field.type === 'boolean' ? true : undefined };
};

/** "Between"'s two values. */
export const valuesBetween = (rule: TBetween): [unknown, unknown] => [
  rule.rules[0].value,
  rule.rules[1].value,
];

/** `subject.related.<plugin>.<relation>` of a measure's path; null off a relation. */
const relationOf = (path: string) =>
  /^subject\.related\.[^.]+\.[^.]+(?=\.)/.exec(path)?.[0] ?? null;

/** `next` with `rule`'s `where`, while both measure the same relation's records; without it otherwise. */
const withWhereOf = (rule: TFilterRule, next: TFilterRule): TFilterRule => {
  if (!isRule(next)) return next;

  const { where, ...plain } = next;
  const kept = isRule(rule) ? rule.where : undefined;

  const relation = relationOf(pathOf(rule));
  const same = !!kept && relation !== null && relation === relationOf(next.path);

  return same ? { ...plain, where: kept } : plain;
};

/** The same rule on another field: kept when the field reads the same way, else started anew. */
export const withField = (
  rule: TFilterRule,
  from: TConditionField | undefined,
  to: TConditionField,
): TFilterRule => {
  if (from?.type !== to.type || !from?.relation !== !to.relation) {
    return withWhereOf(rule, ruleFor(to));
  }

  return withWhereOf(
    rule,
    isRule(rule) ? { ...rule, path: to.path } : between(to.path, ...valuesBetween(rule)),
  );
};

const kindOf = (op: TFilterOperator) =>
  NO_VALUE.has(op) ? 'none' : RELATIVE.has(op) ? 'relative' : LIST_VALUE.has(op) ? 'list' : 'one';

/**
 * The rule with another operator. The value stays while it still means the same (a list for
 * "is any of" and "is none of", a number for the comparisons); otherwise it starts empty.
 */
export const withOperator = (rule: TFilterRule, op: TFilterOperator): TFilterRule =>
  withWhereOf(rule, operatorChanged(rule, op));

const operatorChanged = (rule: TFilterRule, op: TFilterOperator): TFilterRule => {
  const path = pathOf(rule);
  const current = opOf(rule);

  if (op === 'between') {
    return isRule(rule) && kindOf(current) === 'one'
      ? between(path, rule.value, undefined)
      : between(path, undefined, undefined);
  }

  if (!isRule(rule)) return { path, op, value: NO_VALUE.has(op) ? undefined : rule.rules[0].value };

  if (kindOf(op) === kindOf(current)) return { ...rule, op };

  if (kindOf(op) === 'relative') return { path, op, value: { amount: 30, unit: 'days' } };

  if (kindOf(op) === 'list' && rule.value !== undefined && kindOf(current) === 'one') {
    return { path, op, value: [rule.value] };
  }

  return { path, op };
};

const filled = (value: unknown) =>
  value !== undefined &&
  value !== null &&
  value !== '' &&
  !(typeof value === 'number' && !Number.isFinite(value));

/** Whether a rule says enough to filter by: its value is there, or it needs none. */
const isComplete = (rule: TConditionRule): boolean => {
  if (NO_VALUE.has(rule.op)) return true;

  if (RELATIVE.has(rule.op)) return RelativeAmount.safeParse(rule.value).success;

  if (LIST_VALUE.has(rule.op)) return Array.isArray(rule.value) && rule.value.some(filled);

  return filled(rule.value);
};

/** Whether an editor's rule says enough: a "between" needs both ends. */
export const isFilled = (rule: TFilterRule) =>
  isRule(rule) ? isComplete(rule) : rule.rules.every(isComplete);

/**
 * The conditions without the rules still being written: a group drops its unfinished rules,
 * an empty group goes, and a group left with one rule is that rule (one side of a "between").
 * Null when nothing is left.
 */
export const completeOf = (group: TConditionGroup): TConditionGroup | null => {
  const rules = group.rules.flatMap((node): (TConditionRule | TConditionGroup)[] => {
    if (isRule(node)) {
      if (!isComplete(node)) return [];

      // A `where` keeps its finished rules; with none left, the rule counts every record.
      const { where, ...plain } = node;
      const narrowed = where ? completeOf(where) : null;

      return [narrowed ? { ...plain, where: narrowed } : plain];
    }

    const inner = completeOf(node);

    if (!inner) return [];

    const [only] = inner.rules;

    return inner.rules.length === 1 && only ? [only] : [inner];
  });

  return rules.length ? { ...group, rules } : null;
};

/** How many rules a group holds, a "between" counting as one. */
export const ruleCount = (group: TConditionGroup): number =>
  group.rules.reduce((count, node) => count + (isFilterRule(node) ? 1 : ruleCount(node)), 0);
