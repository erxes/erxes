import type { ConditionGroup } from '@erxes/core-contract';
import { describe, expect, it } from 'vite-plus/test';
import { joinPicks, splitPicks } from '../pickRules';

const PAGE = 'event.payload.integrationId';

const content = { path: 'event.payload.content', op: 'contains' as const, value: 'price' };

describe('record picks under the event', () => {
  it('keeps picked pages and other conditions apart, and puts them back as one group', () => {
    const saved: ConditionGroup = {
      match: 'all',
      rules: [{ path: PAGE, op: 'in', value: ['p1', 'p2'] }, content],
    };

    const { picks, rest } = splitPicks(saved, [PAGE]);

    expect(picks).toEqual({ [PAGE]: ['p1', 'p2'] });
    expect(rest).toEqual({ match: 'all', rules: [content] });
    expect(joinPicks(picks, rest)).toEqual(saved);
  });

  it('runs only on the picked pages even when the other conditions match any', () => {
    const either: ConditionGroup = {
      match: 'any',
      rules: [content, { ...content, value: 'cost' }],
    };

    const joined = joinPicks({ [PAGE]: ['p1'] }, either);

    expect(joined).toEqual({
      match: 'all',
      rules: [{ path: PAGE, op: 'in', value: ['p1'] }, either],
    });
    expect(splitPicks(joined, [PAGE])).toEqual({ picks: { [PAGE]: ['p1'] }, rest: either });
  });

  it('drops the rule when no page is picked, so every page starts a run', () => {
    expect(joinPicks({ [PAGE]: [] }, undefined)).toBeUndefined();
    expect(splitPicks(undefined, [PAGE])).toEqual({ picks: {}, rest: undefined });
  });
});
