import { describe, expect, it } from 'vite-plus/test';
import { formatWith, maskInputText, parseInputDate, toDate } from './date-picker-value';

const day = new Date(2024, 1, 5, 14, 7);

describe('DatePicker formats (Day.js tokens)', () => {
  it('formats the default, display and plugin formats', () => {
    expect(formatWith(day, 'YYYY-MM-DD')).toBe('2024-02-05');
    expect(formatWith(day, 'MMM D, YYYY')).toBe('Feb 5, 2024');
    expect(formatWith(day, 'DD.MM.YYYY')).toBe('05.02.2024');
    expect(formatWith(day, 'dddd hh:mm A')).toBe('Monday 02:07 PM');
    expect(formatWith(day, '[Day] D')).toBe('Day 5');
  });

  it('parses typed dates strictly, with unpadded parts only when loose', () => {
    expect(parseInputDate('2024-02-05', 'YYYY-MM-DD', {})).toEqual(new Date(2024, 1, 5));
    expect(parseInputDate('2024-2-5', 'YYYY-MM-DD', {})).toBeUndefined();
    expect(parseInputDate('2024-2-5', 'YYYY-MM-DD', { loose: true })).toEqual(new Date(2024, 1, 5));
    expect(parseInputDate('2024-02-30', 'YYYY-MM-DD', {})).toBeUndefined();
    expect(parseInputDate('05.02.2024', 'DD.MM.YYYY', {})).toEqual(new Date(2024, 1, 5));
  });

  it('keeps typed dates inside the bounds, by day', () => {
    const bounds = { minBound: new Date(2024, 1, 5, 18), maxBound: new Date(2024, 1, 10, 6) };

    expect(parseInputDate('2024-02-05', 'YYYY-MM-DD', bounds)).toEqual(new Date(2024, 1, 5));
    expect(parseInputDate('2024-02-10', 'YYYY-MM-DD', bounds)).toEqual(new Date(2024, 1, 10));
    expect(parseInputDate('2024-02-04', 'YYYY-MM-DD', bounds)).toBeUndefined();
    expect(parseInputDate('2024-02-11', 'YYYY-MM-DD', bounds)).toBeUndefined();
  });

  it('masks typed text and clamps month and day', () => {
    expect(maskInputText('20240231', 'YYYY-MM-DD')).toBe('2024-02-29');
    expect(maskInputText('2023/13', 'YYYY-MM-DD')).toBe('2023-12');
    expect(maskInputText('2023/13', 'DD.MM.YYYY')).toBe('2023/13');
  });

  it('reads date-only strings as local days and rejects junk', () => {
    expect(toDate('2024-02-05')).toEqual(new Date(2024, 1, 5));
    expect(toDate(day.getTime())).toEqual(day);
    expect(toDate('not a date')).toBeUndefined();
    expect(toDate('')).toBeUndefined();
  });
});
