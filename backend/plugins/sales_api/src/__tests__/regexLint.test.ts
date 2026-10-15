import { Linter } from 'eslint';

// Exercise the Sales guard independently of the workspace's other lint rules.
jest.mock('../../../../../eslint.config.js', () => []);
const configs: Linter.Config[] = require('../../eslint.config.js');
const rule = configs.find((config) => config.rules?.['no-restricted-syntax'])
  ?.rules?.['no-restricted-syntax'];

if (!rule) {
  throw new Error('Sales regex lint guard is missing');
}

const linter = new Linter();
const lint = (source: string) =>
  linter.verify(source, { rules: { 'no-restricted-syntax': rule } });

describe.each(['new RegExp', 'RegExp'])('%s regex guard', (constructor) => {
  it('allows variable flags when the pattern is escaped', () => {
    expect(lint(`${constructor}(escapeRegExp(input), flags)`)).toEqual([]);
  });

  it('still rejects an unsafe pattern when flags are variable', () => {
    expect(lint(`${constructor}(input, flags)`)).toEqual([
      expect.objectContaining({ ruleId: 'no-restricted-syntax', severity: 2 }),
    ]);
  });

  it.each([
    'input',
    '`^${input}$`',
    "'^' + input + '$'",
    "'^' + (escapeRegExp(input) + otherInput) + '$'",
  ])('rejects unescaped input: %s', (pattern) => {
    expect(lint(`${constructor}(${pattern}, 'i')`)).toEqual([
      expect.objectContaining({ ruleId: 'no-restricted-syntax', severity: 2 }),
    ]);
  });

  it.each([
    "'^literal[0-9]+$'",
    'escapeRegExp(input)',
    '`^${escapeRegExp(input)}[0-9]+$`',
    "'^' + (escapeRegExp(input) + '[0-9]+$')",
  ])('accepts literal or escaped input: %s', (pattern) => {
    expect(lint(`${constructor}(${pattern}, 'i')`)).toEqual([]);
  });
});

describe.each(['$regex', "'$regex'"])('%s Mongo regex guard', (key) => {
  it('rejects unescaped input', () => {
    expect(lint(`({ ${key}: input })`)).toEqual([
      expect.objectContaining({ ruleId: 'no-restricted-syntax', severity: 2 }),
    ]);
  });

  it('accepts escaped input with fixed regex syntax', () => {
    expect(
      lint(`({ ${key}: '.*' + escapeRegExp(input) + '.*', $options: 'i' })`),
    ).toEqual([]);
  });
});
