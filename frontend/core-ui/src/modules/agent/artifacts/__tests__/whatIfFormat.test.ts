import {
  formatWhatIfEditable,
  formatWhatIfInputDelta,
  formatWhatIfPercentChange,
  formatWhatIfValue,
  parseWhatIfNumber,
  resolveWhatIfKind,
  whatIfAffixes,
  whatIfChange,
  whatIfScaleKey,
  whatIfStepDecimals,
  whatIfTone,
} from '../whatIfFormat';

const locale = 'en-US';

it('resolves explicit formats and infers legacy unit formats', () => {
  expect(resolveWhatIfKind({ format: 'currency', currency: 'MNT' })).toEqual({
    kind: 'currency',
    currency: 'MNT',
  });
  expect(resolveWhatIfKind({ unit: 'MNT' })).toEqual({
    kind: 'currency',
    currency: 'MNT',
  });
  expect(resolveWhatIfKind({ unit: '₮' })).toEqual({
    kind: 'currency',
    currency: 'MNT',
  });
  expect(resolveWhatIfKind({ unit: '%' })).toEqual({ kind: 'percent' });
  expect(resolveWhatIfKind({ format: 'percent' })).toEqual({
    kind: 'percent',
  });
  expect(resolveWhatIfKind({ unit: 'deals' })).toEqual({
    kind: 'number',
    unit: 'deals',
  });
  expect(resolveWhatIfKind({ format: 'number', unit: 'USD' })).toEqual({
    kind: 'number',
    unit: 'USD',
  });
  expect(resolveWhatIfKind({ format: 'currency' })).toEqual({
    kind: 'number',
    unit: undefined,
  });
  expect(whatIfScaleKey({ unit: 'MNT' })).toBe(
    whatIfScaleKey({ format: 'currency', currency: 'MNT' }),
  );
});

it('formats currency, percentage points, units and compact labels', () => {
  const mnt = { format: 'currency', currency: 'MNT' } as const;
  expect(formatWhatIfValue(3962977, mnt, { locale })).toBe('₮3,962,977');
  expect(formatWhatIfValue(118_900_000, mnt, { locale, compact: true })).toBe(
    '₮119M',
  );
  expect(
    formatWhatIfValue(-1200, { unit: 'USD' }, { locale, sign: true }),
  ).toBe('-$1,200');
  expect(formatWhatIfValue(48.4, { unit: '%' }, { locale })).toBe('48.4%');
  expect(formatWhatIfValue(62, { unit: 'deals' }, { locale })).toBe('62 deals');
  expect(formatWhatIfValue(5.256, {}, { locale })).toBe('5.26');
  expect(formatWhatIfValue(5, { decimals: 2 }, { locale })).toBe('5.00');
  expect(formatWhatIfValue(12345, mnt, { locale, plain: true })).toBe('12,345');
  expect(formatWhatIfValue(null, mnt)).toBe('Unavailable');
  expect(formatWhatIfEditable(12345.5, locale)).toBe('12345.5');
});

it('returns locale-positioned adornments', () => {
  expect(whatIfAffixes({ unit: 'MNT' }, locale)).toEqual({ prefix: '₮' });
  expect(whatIfAffixes({ unit: 'EUR' }, 'de-DE')).toEqual({ suffix: '€' });
  expect(whatIfAffixes({ unit: '%' }, locale)).toEqual({ suffix: '%' });
  expect(whatIfAffixes({ unit: 'deals' }, locale)).toEqual({ suffix: 'deals' });
  expect(whatIfAffixes({}, locale)).toEqual({});
});

it('parses locale numbers and rejects non-numeric text', () => {
  expect(parseWhatIfNumber('3,962,977', locale)).toBe(3962977);
  expect(parseWhatIfNumber(' ₮1,200.5 ', locale)).toBe(1200.5);
  expect(parseWhatIfNumber('48.4%', locale)).toBe(48.4);
  expect(parseWhatIfNumber('−5', locale)).toBe(-5);
  expect(parseWhatIfNumber('1.234,5', 'de-DE')).toBe(1234.5);
  for (const invalid of ['', '-', 'abc', '1+1', '1..2', 'Infinity', '0x10'])
    expect(parseWhatIfNumber(invalid, locale)).toBeNull();
});

it('describes changes from baseline with tones and step precision', () => {
  expect(whatIfChange(200, 600)).toEqual({ absolute: 400, relative: 200 });
  expect(whatIfChange(0, 5)).toEqual({ absolute: 5, relative: null });
  expect(whatIfChange(0.1 + 0.2, 0.3)?.absolute).toBe(0);
  expect(whatIfChange(null, 5)).toBeNull();
  expect(formatWhatIfPercentChange(12.34, locale)).toBe('+12%');
  expect(formatWhatIfPercentChange(-4.26, locale)).toBe('-4.3%');
  expect(formatWhatIfInputDelta(50, 56, {}, locale)).toBe('+12%');
  expect(formatWhatIfInputDelta(48.4, 51.6, { unit: '%' }, locale)).toBe(
    '+3.2 pp',
  );
  expect(formatWhatIfInputDelta(0, 5, { unit: 'USD' }, locale)).toBe('+$5');
  expect(formatWhatIfInputDelta(5, 5, {}, locale)).toBeNull();
  expect(whatIfTone(5)).toBe('positive');
  expect(whatIfTone(5, 'lower')).toBe('negative');
  expect(whatIfTone(-5, 'lower')).toBe('positive');
  expect(whatIfTone(0)).toBe('neutral');
  expect(whatIfStepDecimals(1)).toBe(0);
  expect(whatIfStepDecimals(0.25)).toBe(2);
  expect(whatIfStepDecimals(1e-7)).toBe(6);
});

it('keeps small relative changes visible', () => {
  expect(formatWhatIfPercentChange(-0.0267, locale)).toBe('-0.027%');
  expect(formatWhatIfPercentChange(0.5, locale)).toBe('+0.5%');
});
