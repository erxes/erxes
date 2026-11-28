import { describe, expect, it } from 'vite-plus/test';
import { displayNum, formatAmount, formatter } from './format';
import { fixNum } from './numbers';

describe('fixNum', () => {
  it('rounds to 4 decimals by default, and to the decimals asked for', () => {
    expect(fixNum(1.234_567)).toBe(1.2346);
    expect(fixNum(1.234_567, 2)).toBe(1.23);
    expect(fixNum(2.5, 0)).toBe(3);
  });

  it('rounds a half up where floating point lands just under it', () => {
    expect(fixNum(1.005, 2)).toBe(1.01);
    expect(fixNum(0.1 + 0.2, 2)).toBe(0.3);
  });

  it('reads typed text with thousands separators, and anything else as 0', () => {
    expect(fixNum('1,234.5678')).toBe(1234.5678);
    expect(fixNum('abc')).toBe(0);
    expect(fixNum(null)).toBe(0);
    expect(fixNum(undefined)).toBe(0);
  });
});

describe('displayNum', () => {
  it('shows exactly the decimals asked for, with thousands separators', () => {
    expect(displayNum(1234.5)).toBe('1,234.50');
    expect(displayNum(1234.5678, 3)).toBe('1,234.568');
    expect(displayNum('1,000', 0)).toBe('1,000');
    expect(displayNum(null)).toBe('0.00');
  });
});

describe("useFormat's number", () => {
  const { number } = formatter('en');

  it('shows up to 3 decimals, or exactly or up to the decimals asked for', () => {
    expect(number(1234.567_89)).toBe('1,234.568');
    expect(number(1234.5, { decimals: 2 })).toBe('1,234.50');
    expect(number(0.5, { decimals: 0 })).toBe('1');
    expect(number(1.234_56, { maxDecimals: 4 })).toBe('1.2346');
    expect(number(1.5, { maxDecimals: 4 })).toBe('1.5');
  });
});

describe('formatAmount', () => {
  it('cuts a short amount to thousands, millions or billions', () => {
    expect(formatAmount(950, 'short')).toBe('950');
    expect(formatAmount(1500, 'short')).toBe('1.5k');
    expect(formatAmount(2_000_000, 'short')).toBe('2m');
    expect(formatAmount(3_250_000_000, 'short')).toBe('3.3b');
  });

  it('rounds any other amount to 2 decimals with separators', () => {
    expect(formatAmount(1234.567)).toBe((1234.57).toLocaleString());
    expect(formatAmount(1234.567, 'finance')).toBe((1234.57).toLocaleString());
  });
});
