import type { ConditionRule } from '@erxes/core-contract';
import { describe, expect, it } from 'vite-plus/test';
import { daysToAnniversary, evaluateRule } from '~/modules/automations/conditions';
import { nextOccurrence } from '~/modules/automations/schedule';
import { render } from '~/modules/automations/templates';

/** Whether one rule on the date `d` holds. */
const holds = (op: ConditionRule['op'], value: unknown, d: string) =>
  evaluateRule({ path: 'd', op, value }, { d });

describe('relative dates in automation conditions', () => {
  const now = new Date();
  const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000).toISOString();

  it('within the last, more than ago, within the next, anniversaries', () => {
    expect(holds('within_last', { amount: 7, unit: 'days' }, daysAgo(3))).toBe(true);
    expect(holds('within_last', { amount: 7, unit: 'days' }, daysAgo(9))).toBe(false);
    expect(holds('more_than_ago', { amount: 1, unit: 'months' }, daysAgo(40))).toBe(true);
    expect(holds('within_next', { amount: 2, unit: 'weeks' }, daysAgo(-5))).toBe(true);

    // Born years ago, the day comes round in 3 days.
    const inThree = new Date(now.getTime() + 3 * 86_400_000);
    const birthday = `1990-${inThree.toISOString().slice(5, 10)}`;

    expect(daysToAnniversary(birthday, now)).toBe(3);
    expect(holds('anniversary_within', { amount: 7 }, birthday)).toBe(true);
    expect(holds('anniversary_within', { amount: 2 }, birthday)).toBe(false);
    // 29 February counts on 28 February in other years.
    expect(daysToAnniversary('2000-02-29', new Date(Date.UTC(2027, 1, 27)))).toBe(1);
  });
});

describe('automation templates', () => {
  const context = {
    subject: {
      firstName: 'bold',
      tags: ['a', 'b'],
      score: 4.56789,
      createdAt: '2026-01-31T10:00:00.000Z',
    },
    event: {},
    steps: {},
  };

  it('fills placeholders with filters, keeping types when the whole value is one placeholder', () => {
    expect(render('Hi {{subject.firstName | capitalize}}!', context)).toBe('Hi Bold!');
    expect(render('{{subject.lastName | default: "there"}}', context)).toBe('there');
    expect(render('{{subject.tags}}', context)).toEqual(['a', 'b']);
    expect(render('{{subject.tags | join: " / "}} ({{subject.tags | count}})', context)).toBe(
      'a / b (2)',
    );
    expect(render('{{subject.score | round: 2}}', context)).toBe(4.57);
    expect(render('{{subject.createdAt | add_days: 3 | date: "YYYY-MM-DD"}}', context)).toBe(
      '2026-02-03',
    );
    expect(render({ nested: ['{{subject.firstName | upper}}'] }, context)).toEqual({
      nested: ['BOLD'],
    });
    // Only known paths and filters: nothing else is read or run.
    expect(render('{{process.env.SECRET}}', context)).toBeNull();
    expect(() => render('{{subject.firstName | exec: "rm"}}', context)).toThrow(/Unknown filter/);
  });
});

describe('automation schedules', () => {
  it('finds the next time in the time zone: daily, weekly on weekdays, monthly, hourly', () => {
    const ub = 'Asia/Ulaanbaatar'; // UTC+8
    const after = new Date('2026-11-12T03:00:00Z'); // Thursday 11:00 in Ulaanbaatar

    expect(
      nextOccurrence(
        { kind: 'schedule', every: 'day', at: '09:00', timezone: ub },
        after,
      ).toISOString(),
    ).toBe('2026-11-13T01:00:00.000Z');
    expect(
      nextOccurrence(
        { kind: 'schedule', every: 'day', at: '12:00', timezone: ub },
        after,
      ).toISOString(),
    ).toBe('2026-11-12T04:00:00.000Z');
    expect(
      nextOccurrence(
        { kind: 'schedule', every: 'week', weekdays: [1], at: '09:00', timezone: ub },
        after,
      ).toISOString(),
    ).toBe('2026-11-16T01:00:00.000Z');
    expect(
      nextOccurrence(
        { kind: 'schedule', every: 'month', dayOfMonth: 31, at: '09:00', timezone: ub },
        after,
      ).toISOString(),
    ).toBe('2026-11-30T01:00:00.000Z');
    expect(
      nextOccurrence(
        { kind: 'schedule', every: 'hour', at: '00:15', timezone: ub },
        after,
      ).toISOString(),
    ).toBe('2026-11-12T03:15:00.000Z');
    // A zone with summer time.
    expect(
      nextOccurrence(
        { kind: 'schedule', every: 'day', at: '09:00', timezone: 'Europe/Berlin' },
        new Date('2026-07-01T12:00:00Z'),
      ).toISOString(),
    ).toBe('2026-07-02T07:00:00.000Z');
  });
});
