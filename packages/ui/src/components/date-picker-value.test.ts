import { describe, expect, it } from 'vite-plus/test';
import { maskInputText, parseInputDate, toDate } from './date-picker-value';

const day = new Date(2024, 1, 5, 14, 7);

describe('DatePicker typed input (yyyy-MM-dd)', () => {
  it('parses typed dates strictly, with unpadded parts only when loose', () => {
    expect(parseInputDate('2024-02-05', {})).toEqual(new Date(2024, 1, 5));
    expect(parseInputDate('2024-2-5', {})).toBeUndefined();
    expect(parseInputDate('2024-2-5', { loose: true })).toEqual(new Date(2024, 1, 5));
    expect(parseInputDate('2024-02-30', {})).toBeUndefined();
  });

  it('keeps typed dates inside the bounds, by day', () => {
    const bounds = { minBound: new Date(2024, 1, 5, 18), maxBound: new Date(2024, 1, 10, 6) };

    expect(parseInputDate('2024-02-05', bounds)).toEqual(new Date(2024, 1, 5));
    expect(parseInputDate('2024-02-10', bounds)).toEqual(new Date(2024, 1, 10));
    expect(parseInputDate('2024-02-04', bounds)).toBeUndefined();
    expect(parseInputDate('2024-02-11', bounds)).toBeUndefined();
  });

  it('masks typed text and clamps month and day', () => {
    expect(maskInputText('20240231')).toBe('2024-02-29');
    expect(maskInputText('2023/13')).toBe('2023-12');
  });

  it('reads date-only strings as local days and rejects junk', () => {
    expect(toDate('2024-02-05')).toEqual(new Date(2024, 1, 5));
    expect(toDate(day.getTime())).toEqual(day);
    expect(toDate('not a date')).toBeUndefined();
    expect(toDate('')).toBeUndefined();
  });
});
