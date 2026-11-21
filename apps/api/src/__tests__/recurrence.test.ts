import { describe, expect, it } from 'vite-plus/test';
import { nextRun, type Recurrence } from '~/lib/recurrence';
import { latestDue, nextRunWithin, runsFrom } from '~/modules/broadcasts/repeatRule';

const UB = 'Asia/Ulaanbaatar';

const NEW_YORK = 'America/New_York';

/** The next `count` runs of a rule after `after`, as ISO strings. */
const runs = (rule: Recurrence, timeZone: string, after: string, count: number) => {
  const plan = { ...rule, endsOn: null, maxRuns: null, runs: 0 };
  const first = nextRunWithin(plan, timeZone, new Date(after));

  return runsFrom(plan, timeZone, { first, count }).map((at) => at.toISOString());
};

/** Repeat rules: the next run after a moment, on a time zone's clock. */
describe('recurrence', () => {
  // Thursday 12 November 2026, 11:00 in Ulaanbaatar (UTC+8).
  const thursday = '2026-11-12T03:00:00Z';

  it('runs weekly on each chosen weekday, and every other week from its start', () => {
    expect(runs({ frequency: 'week', weekdays: [1, 3, 5], at: '09:00' }, UB, thursday, 4)).toEqual([
      '2026-11-13T01:00:00.000Z',
      '2026-11-16T01:00:00.000Z',
      '2026-11-18T01:00:00.000Z',
      '2026-11-20T01:00:00.000Z',
    ]);

    // Started on Monday 2 November: the weeks of 2, 16 and 30 November.
    expect(
      runs(
        { frequency: 'week', interval: 2, weekdays: [2], at: '18:30', startsOn: '2026-11-02' },
        UB,
        thursday,
        3,
      ),
    ).toEqual(['2026-11-17T10:30:00.000Z', '2026-12-01T10:30:00.000Z', '2026-12-15T10:30:00.000Z']);
  });

  it('runs every N days from the start day, and not before it', () => {
    expect(
      runs({ frequency: 'day', interval: 3, at: '08:00', startsOn: '2026-11-20' }, UB, thursday, 3),
    ).toEqual(['2026-11-20T00:00:00.000Z', '2026-11-23T00:00:00.000Z', '2026-11-26T00:00:00.000Z']);
  });

  it('runs monthly on the 31st, on the last day of a shorter month', () => {
    expect(
      runs({ frequency: 'month', dayOfMonth: 31, at: '09:00' }, UB, '2027-01-01T00:00:00Z', 4),
    ).toEqual([
      '2027-01-31T01:00:00.000Z',
      '2027-02-28T01:00:00.000Z',
      '2027-03-31T01:00:00.000Z',
      '2027-04-30T01:00:00.000Z',
    ]);

    // Every third month from January.
    expect(
      runs(
        { frequency: 'month', interval: 3, dayOfMonth: 15, at: '09:00', startsOn: '2027-01-01' },
        UB,
        '2027-01-01T00:00:00Z',
        3,
      ),
    ).toEqual(['2027-01-15T01:00:00.000Z', '2027-04-15T01:00:00.000Z', '2027-07-15T01:00:00.000Z']);
  });

  it('keeps the wall-clock time across summer time', () => {
    const monday = { frequency: 'week', weekdays: [1], at: '09:00' } as const;

    // New York's clocks go back on 1 November 2026: 09:00 is 13:00 UTC, then 14:00.
    expect(runs(monday, NEW_YORK, '2026-10-20T00:00:00Z', 2)).toEqual([
      '2026-10-26T13:00:00.000Z',
      '2026-11-02T14:00:00.000Z',
    ]);
    // And forward on 14 March 2027.
    expect(runs(monday, NEW_YORK, '2027-03-02T00:00:00Z', 2)).toEqual([
      '2027-03-08T14:00:00.000Z',
      '2027-03-15T13:00:00.000Z',
    ]);
    // A time the change skips (02:30 on 14 March) still runs that day.
    expect(
      nextRun({ frequency: 'day', at: '02:30' }, NEW_YORK, new Date('2027-03-14T05:00:00Z'))
        .toISOString()
        .slice(0, 10),
    ).toBe('2027-03-14');
  });

  it('ends after N runs or on its end date', () => {
    const daily = { frequency: 'day', at: '09:00' } as const;
    const plan = { ...daily, endsOn: null, maxRuns: 3, runs: 1 };
    const first = nextRunWithin(plan, UB, new Date(thursday));

    // One made, so two to go.
    expect(runsFrom(plan, UB, { first, count: 10 })).toHaveLength(2);
    expect(nextRunWithin({ ...plan, runs: 3 }, UB, new Date(thursday))).toBeNull();

    const until = { ...daily, endsOn: '2026-11-14', maxRuns: null, runs: 0 };

    const times = runsFrom(until, UB, {
      first: nextRunWithin(until, UB, new Date(thursday)),
      count: 10,
    });

    expect(times.map((at) => at.toISOString())).toEqual([
      '2026-11-13T01:00:00.000Z',
      '2026-11-14T01:00:00.000Z',
    ]);
  });

  it('after an outage, takes the latest missed run, not each one', () => {
    const plan = { frequency: 'day', at: '09:00', endsOn: null, maxRuns: null, runs: 0 } as const;
    const missed = new Date('2026-11-09T01:00:00Z');

    expect(latestDue(plan, UB, missed, new Date(thursday)).toISOString()).toBe(
      '2026-11-12T01:00:00.000Z',
    );
    // Its end date stops the walk.
    expect(
      latestDue({ ...plan, endsOn: '2026-11-10' }, UB, missed, new Date(thursday)).toISOString(),
    ).toBe('2026-11-10T01:00:00.000Z');
  });
});
