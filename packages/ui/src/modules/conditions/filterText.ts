import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useFormat } from '../../lib/format';
import { useMoney } from '../../lib/money';
import { textOf } from '../../lib/text';
import {
  isRule,
  LIST_VALUE,
  NO_VALUE,
  RelativeAmount,
  type TConditionField,
  type TConditionLookups,
  type TConditionRule,
} from './conditions';
import { type TFilterOperator, type TFilterRule, valuesBetween } from './filterRule';
import { useFieldOptions } from './fieldOptions';

/** English for the `views` namespace's `filter.op.<op>`. */
const OPERATORS: Record<TFilterOperator, string> = {
  eq: 'is',
  neq: 'is not',
  gt: 'is greater than',
  gte: 'is at least',
  lt: 'is less than',
  lte: 'is at most',
  contains: 'contains',
  not_contains: "doesn't contain",
  starts_with: 'starts with',
  in: 'is any of',
  not_in: 'is none of',
  exists: 'is set',
  not_exists: 'is empty',
  within_last: 'is in the last',
  more_than_ago: 'is more than … ago',
  within_next: 'is in the next',
  anniversary_within: 'anniversary in the next',
  between: 'is between',
};

/** Dates compare as days: `filter.op-date.<op>`. */
const DATE_OPERATORS: Partial<Record<TFilterOperator, string>> = {
  eq: 'is on',
  neq: 'is not on',
  gt: 'is after',
  gte: 'is on or after',
  lt: 'is before',
  lte: 'is on or before',
};

/** Numbers read as symbols on a chip. */
const SYMBOLS: Partial<Record<TFilterOperator, string>> = {
  eq: '=',
  neq: '≠',
  gt: '>',
  gte: '≥',
  lt: '<',
  lte: '≤',
};

/** English for `filter.unit.<unit>`, by plural form. */
const UNITS = {
  days: { defaultValue_one: '{{count}} day', defaultValue_other: '{{count}} days' },
  weeks: { defaultValue_one: '{{count}} week', defaultValue_other: '{{count}} weeks' },
  months: { defaultValue_one: '{{count}} month', defaultValue_other: '{{count}} months' },
};

/** An operator in words, for a field's type ("is before" on a date). */
export const useOperatorLabel = () => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });

  return (op: TFilterOperator, type: string | undefined) => {
    const dated = type === 'date' ? DATE_OPERATORS[op] : undefined;

    return dated ? t(`op-date.${op}`, dated) : t(`op.${op}`, OPERATORS[op]);
  };
};

/** A relative amount in words: "30 days". */
export const useSpanText = () => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });

  return ({ amount, unit }: RelativeAmount) => t(`unit.${unit}`, { count: amount, ...UNITS[unit] });
};

const Values = z.array(z.union([z.string(), z.number(), z.boolean()]).transform(String));

/**
 * The values a rule picks: the list of "is any of", or the one of "is". A value that isn't text,
 * a number or yes/no (a date range, a relative amount) picks nothing.
 */
export const valuesOf = (rule: TConditionRule | undefined): string[] => {
  if (!rule || rule.value === undefined || rule.value === null) return [];

  return Values.safeParse(Array.isArray(rule.value) ? rule.value : [rule.value]).data ?? [];
};

/** A rule in words, as a chip shows it: the operator and the value (empty when it needs none). */
export const useRuleText = (
  rule: TFilterRule,
  field: TConditionField | undefined,
  lookups: TConditionLookups,
) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const operator = useOperatorLabel();
  const spanText = useSpanText();
  const money = useMoney();
  const fmt = useFormat();
  const type = field?.type;
  const picked = isRule(rule) ? valuesOf(rule) : [];
  const { options } = useFieldOptions(field, lookups, picked);

  const one = (value: unknown) => {
    if (value === undefined || value === null || value === '') return '…';

    if (type === 'date') {
      const day = textOf(value);

      return /^\d{4}-\d{2}-\d{2}/.test(day) ? fmt.date(day.slice(0, 10)) : day;
    }

    if (type === 'number') {
      const n = Number(value);

      return field?.currency ? money(n, field.currency) : fmt.number(n);
    }

    return textOf(value);
  };

  if (!isRule(rule)) {
    const [from, to] = valuesBetween(rule);

    return { op: operator('between', type), value: `${one(from)} – ${one(to)}` };
  }

  const op = operator(rule.op, type);

  if (NO_VALUE.has(rule.op)) return { op, value: '' };

  const span = RelativeAmount.safeParse(rule.value);

  if (span.success) return { op, value: spanText(span.data) };

  if (type === 'boolean') {
    return {
      op: t('op.eq', 'is'),
      value: textOf(rule.value) === 'true' ? t('yes', 'Yes') : t('no', 'No'),
    };
  }

  if (type === 'number' && SYMBOLS[rule.op]) {
    return { op: SYMBOLS[rule.op] ?? op, value: one(rule.value) };
  }

  if (options.length || LIST_VALUE.has(rule.op)) {
    const labels = picked.map(
      (value) => options.find((option) => option.value === value)?.label ?? value,
    );

    // One pick reads "is" / "is not"; several "is any of" / "is none of".
    const single = labels.length === 1 && LIST_VALUE.has(rule.op);
    const shown = single ? operator(rule.op === 'in' ? 'eq' : 'neq', type) : op;

    return { op: shown, value: labels.join(', ') || '…' };
  }

  if (type === 'date' || type === 'number') return { op, value: one(rule.value) };

  return { op, value: rule.value === undefined ? '…' : `“${textOf(rule.value)}”` };
};
