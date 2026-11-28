import { describe, expect, it } from 'vite-plus/test';
import { parseDateRangeFromString } from './parseDateRangeFromString';

// A Wednesday, mid-afternoon.
const TODAY = new Date(2026, 10, 18, 15, 30);

const local = (range: { from: Date; to: Date } | undefined) =>
  range && [range.from.toLocaleString('sv'), range.to.toLocaleString('sv')];

describe('parseDateRangeFromString', () => {
  it('reads the presets, each up to the end of today', () => {
    expect(local(parseDateRangeFromString('today', TODAY))).toEqual([
      '2026-11-18 00:00:00',
      '2026-11-18 23:59:59',
    ]);
    expect(local(parseDateRangeFromString('last-7-days', TODAY))).toEqual([
      '2026-11-11 00:00:00',
      '2026-11-18 23:59:59',
    ]);
    expect(local(parseDateRangeFromString('last-3-months', TODAY))?.[0]).toBe(
      '2026-08-18 00:00:00',
    );
    expect(local(parseDateRangeFromString('in-the-past', TODAY))?.[0]).toBe('1979-01-01 00:00:00');
  });

  it('reads the presets’ old names from saved links', () => {
    expect(parseDateRangeFromString('1-week-from-now', TODAY)).toEqual(
      parseDateRangeFromString('last-7-days', TODAY),
    );
  });

  it('reads a month, a quarter, a half year and a year', () => {
    expect(local(parseDateRangeFromString('2026-Feb'))).toEqual([
      '2026-02-01 00:00:00',
      '2026-02-28 23:59:59',
    ]);
    expect(local(parseDateRangeFromString('2026-quarter-3'))).toEqual([
      '2026-07-01 00:00:00',
      '2026-09-30 23:59:59',
    ]);
    expect(local(parseDateRangeFromString('2025-half-2'))).toEqual([
      '2025-07-01 00:00:00',
      '2025-12-31 23:59:59',
    ]);
    expect(local(parseDateRangeFromString('2024-y'))).toEqual([
      '2024-01-01 00:00:00',
      '2024-12-31 23:59:59',
    ]);
  });

  it('reads a range of two dates, whole days, and a range missing its end as one day', () => {
    const from = new Date(2026, 2, 3, 10).toISOString();
    const to = new Date(2026, 2, 9, 8).toISOString();

    expect(local(parseDateRangeFromString(`${from},${to}`))).toEqual([
      '2026-03-03 00:00:00',
      '2026-03-09 23:59:59',
    ]);
    expect(local(parseDateRangeFromString(`${from},`))).toEqual([
      '2026-03-03 00:00:00',
      '2026-03-03 23:59:59',
    ]);
  });

  it('reads nothing from no value or one it doesn’t know', () => {
    expect(parseDateRangeFromString(null)).toBeUndefined();
    expect(parseDateRangeFromString('')).toBeUndefined();
    expect(parseDateRangeFromString('next-week')).toBeUndefined();
    expect(parseDateRangeFromString('nope,2026-01-01')).toBeUndefined();
  });
});
