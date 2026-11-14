import type { ConditionRule, FilterField } from '@erxes/core-contract';
import { describe, expect, it } from 'vite-plus/test';
import { anyOf, groupOf, partsOf, presetOf, targetOf, valuesOf, withPart } from '../filterRules';

const kind: FilterField = { path: 'subject.kind', label: 'Type', type: 'select', group: 'fields' };

const price: FilterField = {
  path: 'subject.price',
  label: 'Price',
  type: 'number',
  group: 'fields',
};

const goods: ConditionRule = { path: 'subject.kind', op: 'in', value: ['goods'] };
const cheap: ConditionRule = { path: 'subject.price', op: 'lt', value: 1000 };

describe('filter menu rules', () => {
  it('shows an "any" group of several rules as one part, and keeps the rest as they are', () => {
    const any = { match: 'any' as const, rules: [goods, cheap] };

    expect(partsOf(null)).toEqual([]);
    expect(partsOf({ match: 'all', rules: [goods, cheap] })).toEqual([goods, cheap]);
    expect(partsOf({ match: 'any', rules: [goods] })).toEqual([goods]);
    expect(partsOf(any)).toEqual([any]);
    // Adding to an "any" group asks for it and the new rule.
    expect(groupOf(withPart(partsOf(any), null, cheap))).toEqual({
      match: 'all',
      rules: [any, cheap],
    });
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

  it('changes the one rule of a choice field, but adds number rules (a range is two)', () => {
    expect(targetOf([cheap, goods], kind, null)).toBe(1);
    expect(targetOf([cheap], kind, null)).toBeNull();
    expect(targetOf([cheap], price, null)).toBeNull();
    // A chip opened on a part edits that part.
    expect(targetOf([cheap, goods], price, 0)).toBe(0);
  });

  it('reads and builds "is any of"', () => {
    expect(valuesOf(goods)).toEqual(['goods']);
    expect(valuesOf({ path: 'subject.kind', op: 'eq', value: 'service' })).toEqual(['service']);
    expect(anyOf('subject.kind', ['goods', 'service'])).toEqual({
      path: 'subject.kind',
      op: 'in',
      value: ['goods', 'service'],
    });
    expect(anyOf('subject.kind', [])).toBeNull();
  });

  it('knows a date preset from its rule', () => {
    const week = { path: 'subject.createdAt', op: 'within_last' as const };

    expect(presetOf({ ...week, value: { amount: 7, unit: 'days' } })?.key).toBe('past-week');
    expect(presetOf({ ...week, value: { amount: 8, unit: 'days' } })).toBeUndefined();
    expect(presetOf({ path: 'subject.createdAt', op: 'not_exists' })?.key).toBe('empty');
  });
});
