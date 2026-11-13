import { coerceCell, parseDelimitedTable } from '../converters/csv';

describe('parseDelimitedTable', () => {
  it('parses simple comma rows', () => {
    const { rows, delimiter } = parseDelimitedTable('a,b,c\n1,2,3');
    expect(delimiter).toBe(',');
    expect(rows).toEqual([
      ['a', 'b', 'c'],
      ['1', '2', '3'],
    ]);
  });

  it('keeps delimiters inside quoted fields', () => {
    const { rows } = parseDelimitedTable('name,score\n"Doe, Jane",10');
    expect(rows).toEqual([
      ['name', 'score'],
      ['Doe, Jane', '10'],
    ]);
  });

  it('unescapes doubled quotes', () => {
    const { rows } = parseDelimitedTable('say\n"He said ""hi"""');
    expect(rows).toEqual([['say'], ['He said "hi"']]);
  });

  it('keeps newlines inside quoted fields', () => {
    const { rows } = parseDelimitedTable('a,b\n"x\ny",2');
    expect(rows).toEqual([
      ['a', 'b'],
      ['x\ny', '2'],
    ]);
  });

  it('detects tab delimiters', () => {
    const { rows, delimiter } = parseDelimitedTable('a\tb\n1\t2');
    expect(delimiter).toBe('\t');
    expect(rows).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });

  it('detects semicolon delimiters', () => {
    const { delimiter } = parseDelimitedTable('a;b;c\n1;2;3');
    expect(delimiter).toBe(';');
  });

  it('normalizes CRLF input', () => {
    const { rows } = parseDelimitedTable('a,b\r\n1,2\r\n');
    expect(rows).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });

  it('drops the phantom row from a single trailing newline', () => {
    const { rows } = parseDelimitedTable('a,b\n1,2\n');
    expect(rows).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });

  it('returns no rows for empty content', () => {
    expect(parseDelimitedTable('').rows).toEqual([]);
    expect(parseDelimitedTable('\n\n').rows).toEqual([]);
  });
});

describe('coerceCell', () => {
  it('converts numeric-looking cells to numbers', () => {
    expect(coerceCell('42')).toBe(42);
    expect(coerceCell(' 3.5 ')).toBe(3.5);
    expect(coerceCell('-7')).toBe(-7);
  });

  it('keeps non-numeric and long cells as strings', () => {
    expect(coerceCell('abc')).toBe('abc');
    expect(coerceCell('')).toBe('');
    expect(coerceCell('12345678901234567890')).toBe('12345678901234567890');
    expect(coerceCell('1e999')).toBe('1e999');
  });
});
