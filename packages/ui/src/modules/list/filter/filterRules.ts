import { isRule, type TConditionGroup, type TConditionRule } from '../../conditions/conditions';
import { isFilterRule, type TFilterRule } from '../../conditions/filterRule';

/**
 * The list's filter as chips: rules that must all hold. Null when it has "or" or nested groups:
 * the advanced filter edits it, and the bar shows it as one chip.
 */
export const chipsOf = (group: TConditionGroup | null): TFilterRule[] | null => {
  if (!group) return [];

  if (group.match === 'any' && group.rules.length > 1) return null;

  return group.rules.every(isFilterRule) ? group.rules : null;
};

/** Parts back to the list's filter: null when there are none; one group stands for itself. */
export const groupOf = (parts: FilterPart[]): TConditionGroup | null => {
  const [only] = parts;

  if (parts.length === 1 && only && !isRule(only) && !isFilterRule(only)) return only;

  return parts.length ? { match: 'all', rules: parts } : null;
};

/** A top-level entry of the filter: a rule, or a group (the advanced filter's, or a "between"). */
export type FilterPart = TConditionRule | TConditionGroup;

/**
 * The parts that must all hold: the chips, or the advanced filter as one part, so a chip added
 * beside it narrows it.
 */
export const partsOf = (group: TConditionGroup | null): FilterPart[] =>
  chipsOf(group) ?? (group ? [group] : []);

const same = (a: FilterPart, b: FilterPart) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Replaces the part at `index`, appends when `index` is null, removes when `next` is null.
 * Parts stay distinct: a part already there isn't added twice.
 */
export const withPart = (parts: FilterPart[], index: number | null, next: FilterPart | null) => {
  if (next && parts.some((part, at) => at !== index && same(part, next))) {
    return index === null ? parts : parts.filter((_, at) => at !== index);
  }

  if (index === null) return next ? [...parts, next] : parts;

  return next
    ? parts.map((part, at) => (at === index ? next : part))
    : parts.filter((_, at) => at !== index);
};
