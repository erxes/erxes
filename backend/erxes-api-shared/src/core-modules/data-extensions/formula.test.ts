import {
  castFormulaResult,
  evaluateFormula,
  formulaFieldKeys,
  parseFormula,
} from './formula';
import { validateDataExtensionFieldSettings } from './validation';

const run = (expression: string, values: Record<string, unknown> = {}) =>
  evaluateFormula(parseFormula(expression), values, () => new Date('2027-01-10T00:00:00.000Z'));

describe('formulas', () => {
  const values = {
    value: { amount: 1000, currency: 'MNT' },
    discount: 10,
    status: 'signed',
    startsAt: '2027-01-01T00:00:00.000Z',
    endsAt: '2027-03-01T00:00:00.000Z',
    city: 'Ulaanbaatar',
    tags: ['a', 'b', 'c'],
    note: null,
  };

  it.each([
    ['{value} * (1 - {discount} / 100)', 900],
    ['2 + 3 * 4', 14],
    ['(2 + 3) * 4', 20],
    ['-{discount} + 1', -9],
    ['10 % 4', 2],
    ['IF({status} == "signed", {value}, 0)', 1000],
    ['IF({status} != "signed", 1, 2)', 2],
    ['DAYS({startsAt}, {endsAt})', 59],
    ['DAYS({startsAt}, TODAY())', 9],
    ['ROUND(10 / 3, 2)', 3.33],
    ['MAX({discount}, 3, 42)', 42],
    ['CONCAT(UPPER({city}), "!")', 'ULAANBAATAR!'],
    ['"Status: " + {status}', 'Status: signed'],
    ['LEN({city})', 11],
    ['{tags}', 3],
    ['COALESCE({note}, "none")', 'none'],
    ['ISEMPTY({note}) && {discount} > 5', true],
    ['{value} > 500 || FALSE', true],
  ])('%s = %j', (expression, expected) => {
    expect(run(expression, values)).toEqual(expected);
  });

  it('adds days to dates', () => {
    expect(run('{startsAt} + 30', values)).toEqual(new Date('2027-01-31T00:00:00.000Z'));
  });

  it('gives null rather than failing on missing values and bad maths', () => {
    expect(run('{missing} * 2', values)).toBeNull();
    expect(run('{value} / 0', values)).toBeNull();
    expect(run('DAYS({city}, {endsAt})', values)).toBeNull();
  });

  it('lists the fields it reads', () => {
    expect(formulaFieldKeys(parseFormula('IF({a} > 1, {b}, {a} + {c})')).sort()).toEqual(['a', 'b', 'c']);
  });

  it.each([
    ['', 'Write an expression'],
    ['{value} +', 'ends too early'],
    ['(1 + 2', 'Expected ")"'],
    ['FOO(1)', 'Unknown function'],
    ['IF(1, 2)', 'IF takes 3 values'],
    ['{Bad Key}', 'Field references'],
    ['"open', 'closing quote'],
    ['1 $ 2', 'Unexpected "$"'],
    ['process.exit()', 'Unexpected'],
    ['1 2', 'Unexpected "2"'],
  ])('refuses %j', (expression, message) => {
    expect(() => parseFormula(expression)).toThrow(message);
  });

  it('bounds length and nesting', () => {
    expect(() => parseFormula('1+'.repeat(300) + '1')).toThrow();
    expect(() => parseFormula('('.repeat(40) + '1' + ')'.repeat(40))).toThrow('nested too deeply');
  });

  it('casts results to the declared type', () => {
    expect(castFormulaResult(42, 'text')).toBe('42');
    expect(castFormulaResult('7', 'number')).toBe(7);
    expect(castFormulaResult(new Date('2027-01-01T00:00:00.000Z'), 'date')).toBe('2027-01-01T00:00:00.000Z');
    expect(castFormulaResult(0, 'boolean')).toBe(false);
    expect(castFormulaResult('abc', 'number')).toBeNull();
  });
});

describe('computed field settings', () => {
  it('accepts a valid formula and rollup', () => {
    expect(
      validateDataExtensionFieldSettings('formula', { expression: ' {a} * 2 ', resultType: 'number' }, undefined),
    ).toEqual({ expression: '{a} * 2', resultType: 'number' });
    expect(
      validateDataExtensionFieldSettings('rollup', { rollup: { relation: 'contracts', op: 'sum', field: 'value' } }, undefined),
    ).toEqual({ rollup: { relation: 'contracts', op: 'sum', field: 'value' } });
    expect(
      validateDataExtensionFieldSettings('rollup', { rollup: { relation: 'contracts', op: 'count' } }, undefined),
    ).toEqual({ rollup: { relation: 'contracts', op: 'count' } });
  });

  it.each([
    ['formula', { expression: '{a} +', resultType: 'number' }, 'Formula:'],
    ['formula', { expression: '{a}', resultType: 'money' }, 'returns a number'],
    ['formula', { expression: '{a}', resultType: 'number', required: true }, 'Computed fields cannot'],
    ['rollup', { rollup: { relation: 'contracts', op: 'sum' } }, 'field to total'],
    ['text', { expression: '{a}' }, 'Only formula'],
    ['text', { access: 'admins' }, 'everyone or managers'],
    ['text', { visibleWhen: { field: 'stage', operator: 'regex' } }, 'Show-when'],
  ] as const)('refuses %s with %j', (type, settings, message) => {
    expect(() => validateDataExtensionFieldSettings(type, settings, undefined)).toThrow(message);
  });
});
