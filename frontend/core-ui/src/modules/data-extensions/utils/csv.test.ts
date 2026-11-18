import { IDataExtensionField } from 'ui-modules';
import { fromCsvValue, parseCsv, toCsv, toCsvValue } from './csv';

jest.mock('ui-modules', () => ({}));

const field = (
  type: IDataExtensionField['type'],
  extra: Partial<IDataExtensionField> = {},
): IDataExtensionField => ({
  _id: type,
  recordType: 'custom:contract',
  key: type,
  label: type,
  type,
  order: 0,
  status: 'active',
  ...extra,
});

describe('parseCsv', () => {
  it('reads quotes, doubled quotes, commas and newlines inside cells', () => {
    expect(parseCsv('﻿Name,Note\r\n"Acme, LLC","said ""hi""\nthen left"\r\n\r\nBeta,ok')).toEqual([
      ['Name', 'Note'],
      ['Acme, LLC', 'said "hi"\nthen left'],
      ['Beta', 'ok'],
    ]);
  });
});

describe('toCsv', () => {
  it('quotes where needed and neutralises spreadsheet formulas', () => {
    expect(toCsv([['=HYPERLINK("x")', 'a,b', '-5', 'plain']])).toBe(
      '﻿"\'=HYPERLINK(""x"")","a,b",\'-5,plain\r\n',
    );
  });
});

describe('CSV values', () => {
  const stage = field('select', {
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'signed', label: 'Signed' },
    ],
  });

  it('round-trips typed values through a cell', () => {
    const cases: [IDataExtensionField, unknown][] = [
      [field('currency', { settings: { currency: 'MNT' } }), { amount: 1500, currency: 'USD' }],
      [field('number'), -5],
      [field('multiSelect', { options: stage.options }), ['draft', 'signed']],
      [field('emails'), ['a@x.mn', 'b@x.mn']],
      [field('address'), { city: 'Ulaanbaatar' }],
      [field('boolean'), false],
    ];

    for (const [target, value] of cases) {
      const cell = parseCsv(toCsv([[toCsvValue(target, value as never)]]))[0][0];

      expect(fromCsvValue(target, cell)).toEqual(value);
    }
  });

  it('accepts labels, Mongolian yes/no and currency symbols', () => {
    expect(fromCsvValue(stage, 'signed')).toBe('signed');
    expect(fromCsvValue(stage, 'Draft')).toBe('draft');
    expect(fromCsvValue(field('boolean'), 'Тийм')).toBe(true);
    expect(fromCsvValue(field('currency', { settings: { currency: 'MNT' } }), '₮ 1,200,000')).toEqual({
      amount: 1200000,
      currency: 'MNT',
    });
    expect(fromCsvValue(field('text'), '   ')).toBeUndefined();
  });

  it('explains what could not be read', () => {
    expect(() => fromCsvValue(stage, 'Lost')).toThrow('not an option');
    expect(() => fromCsvValue(field('number'), 'abc')).toThrow('not a number');
    expect(() => fromCsvValue(field('date'), 'someday')).toThrow('not a date');
  });
});
