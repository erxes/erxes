import { describe, expect, it } from 'vite-plus/test';
import { ConditionGroup, type TConditionRule } from '../../conditions/conditions';
import {
  between,
  completeOf,
  isFilterRule,
  operatorsFor,
  ruleCount,
  ruleFor,
  withField,
  withOperator,
} from '../../conditions/filterRule';
import { valuesOf } from '../../conditions/filterText';
import { chipsOf, groupOf, withPart } from './filterRules';

const goods: TConditionRule = { path: 'subject.kind', op: 'in', value: ['goods'] };
const cheap: TConditionRule = { path: 'subject.price', op: 'lt', value: 1000 };

describe('filter chips', () => {
  it('shows rules that all must hold as chips, and "or" or nested groups as the advanced filter', () => {
    const range = between('subject.price', 10, 20);

    expect(chipsOf(null)).toEqual([]);
    expect(chipsOf({ match: 'all', rules: [goods, range] })).toEqual([goods, range]);
    expect(chipsOf({ match: 'any', rules: [goods] })).toEqual([goods]);
    expect(chipsOf({ match: 'any', rules: [goods, cheap] })).toBeNull();
    expect(chipsOf({ match: 'all', rules: [goods, { match: 'any', rules: [cheap] }] })).toBeNull();
    expect(
      ruleCount({ match: 'any', rules: [goods, { match: 'all', rules: [cheap, range] }] }),
    ).toBe(3);
  });

  it('adds, replaces and removes parts, never holding the same one twice', () => {
    expect(withPart([goods], null, cheap)).toEqual([goods, cheap]);
    expect(withPart([goods, cheap], 1, { ...cheap, op: 'gt' })).toEqual([
      goods,
      { ...cheap, op: 'gt' },
    ]);
    expect(withPart([goods, cheap], 0, null)).toEqual([cheap]);
    expect(withPart([goods, cheap], null, cheap)).toEqual([goods, cheap]);
    // Editing a part into one already there leaves one of them.
    expect(withPart([goods, cheap, { ...cheap, value: 5 }], 2, cheap)).toEqual([goods, cheap]);
    expect(groupOf([])).toBeNull();
  });
});

describe('rules being written', () => {
  it('starts a field on its type’s first operator', () => {
    expect(ruleFor({ path: 'subject.kind', type: 'select' })).toEqual({
      path: 'subject.kind',
      op: 'in',
      value: undefined,
    });
    expect(ruleFor({ path: 'subject.createdAt', type: 'date' })).toEqual({
      path: 'subject.createdAt',
      op: 'within_last',
      value: { amount: 30, unit: 'days' },
    });
  });

  it('keeps the value across operators that read it the same way', () => {
    expect(withOperator(cheap, 'gt')).toEqual({ ...cheap, op: 'gt' });
    expect(withOperator(goods, 'not_in')).toEqual({ ...goods, op: 'not_in' });
    expect(withOperator(cheap, 'exists')).toEqual({ path: 'subject.price', op: 'exists' });
    const range = withOperator(cheap, 'between');

    expect(range).toEqual(between('subject.price', 1000, undefined));
    expect(isFilterRule(range)).toBe(true);
    expect(withOperator(range, 'lte')).toEqual({ path: 'subject.price', op: 'lte', value: 1000 });
  });

  it('drops unfinished rules, empty groups and a "between" missing an end', () => {
    expect(
      completeOf({
        match: 'all',
        rules: [
          goods,
          { path: 'subject.kind', op: 'in', value: [] },
          { match: 'any', rules: [] },
          between('subject.price', 10, undefined),
        ],
      }),
    ).toEqual({ match: 'all', rules: [goods, { path: 'subject.price', op: 'gte', value: 10 }] });
    expect(
      completeOf({ match: 'all', rules: [{ path: 'subject.name', op: 'contains' }] }),
    ).toBeNull();
  });

  it('keeps a relation rule’s where while it measures the same records', () => {
    const won = {
      match: 'all' as const,
      rules: [{ path: 'subject.stage', op: 'eq' as const, value: 'Won' }],
    };

    const deals = {
      label: 'Deals',
      fields: [{ path: 'subject.stage', label: 'Stage', type: 'select' }],
    };

    const count: TConditionRule = {
      path: 'subject.related.sales.deals.count',
      op: 'gte',
      value: 3,
      where: won,
    };

    const total = {
      path: 'subject.related.sales.deals.sum.amount',
      label: 'Total',
      type: 'number',
      relation: deals,
    };

    const orders = {
      path: 'subject.related.ecom.orders.count',
      label: 'Orders',
      type: 'number',
      relation: deals,
    };

    const countField = { path: count.path, label: 'Count', type: 'number', relation: deals };

    expect(operatorsFor(countField)).not.toContain('between');
    expect(ruleFor(countField)).toEqual({ path: count.path, op: 'gte', value: undefined });
    expect(withOperator(count, 'lt')).toEqual({ ...count, op: 'lt' });
    expect(withField(count, countField, total)).toEqual({ ...count, path: total.path });
    expect(withField(count, countField, orders)).toEqual({
      ...count,
      path: orders.path,
      where: undefined,
    });
    // An unfinished where goes; the rule then counts every deal.
    expect(
      completeOf({
        match: 'all',
        rules: [
          {
            ...count,
            where: {
              match: 'all',
              rules: [won.rules[0], { path: 'subject.stage', op: 'in', value: [] }],
            },
          },
        ],
      }),
    ).toEqual({ match: 'all', rules: [count] });
    expect(
      completeOf({ match: 'all', rules: [{ ...count, where: { match: 'all', rules: [] } }] }),
    ).toEqual({
      match: 'all',
      rules: [{ path: count.path, op: 'gte', value: 3 }],
    });
    // The address keeps it.
    expect(ConditionGroup.parse({ match: 'all', rules: [count] })).toEqual({
      match: 'all',
      rules: [count],
    });
  });

  it('reads the values a rule picks', () => {
    expect(valuesOf(goods)).toEqual(['goods']);
    expect(valuesOf({ path: 'subject.kind', op: 'eq', value: 'service' })).toEqual(['service']);
    expect(
      valuesOf({ path: 'subject.createdAt', op: 'within_last', value: { amount: 1 } }),
    ).toEqual([]);
  });
});
