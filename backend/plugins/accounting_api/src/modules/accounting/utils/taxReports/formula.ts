const TITLE_KIND = 'title';

const MAX_RANGE_SIZE = 1000;
const RANGE_PATTERN = /(\d+)\s*\.\.\s*(\d+)/g;

type Token =
  | { type: 'number'; value: number }
  | { type: 'ref'; value: string }
  | { type: 'op'; value: '+' | '-' | '*' | '/' | '(' | ')' };

export interface ITaxFormulaRow {
  number: string;
  kind: string;
  formula?: string;
  valueSide?: string;
}

export const normalizeTaxRowNumber = (value: unknown) => {
  const text = String(value ?? '').trim();

  return /^\d+$/.test(text) ? String(Number(text)) : text;
};

// Erkhet writes "11..25" for {11} + ... + {25}; the range stays grouped so a
// multiplier in front of it applies to the whole sum.
export const expandTaxFormulaRanges = (formula: string) =>
  formula.replace(RANGE_PATTERN, (_match, from: string, to: string) => {
    const start = Number(from);
    const end = Number(to);

    if (end < start || end - start > MAX_RANGE_SIZE) {
      throw new Error(`Invalid tax row range: ${from}..${to}`);
    }

    const refs = Array.from(
      { length: end - start + 1 },
      (_value, index) => `{${start + index}}`,
    );

    return `(${refs.join(' + ')})`;
  });

const tokenize = (formula: string): Token[] => {
  const tokens: Token[] = [];
  let index = 0;

  while (index < formula.length) {
    const char = formula[index];

    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    if (char === '{') {
      const end = formula.indexOf('}', index);
      const ref = end > index ? formula.slice(index + 1, end).trim() : '';

      if (!/^\d+$/.test(ref)) {
        throw new Error(
          `Invalid tax row reference near "${formula.slice(index)}"`,
        );
      }

      tokens.push({ type: 'ref', value: normalizeTaxRowNumber(ref) });
      index = end + 1;
      continue;
    }

    const numberMatch = /^\d+(\.\d+)?/.exec(formula.slice(index));
    if (numberMatch) {
      tokens.push({ type: 'number', value: Number(numberMatch[0]) });
      index += numberMatch[0].length;
      continue;
    }

    if ('+-*/()'.includes(char)) {
      tokens.push({
        type: 'op',
        value: char as '+' | '-' | '*' | '/' | '(' | ')',
      });
      index += 1;
      continue;
    }

    throw new Error(`Unsupported character "${char}" in tax row formula`);
  }

  return tokens;
};

export const evaluateTaxFormula = (
  formula: string,
  resolveRef: (number: string) => number,
): number => {
  const tokens = tokenize(expandTaxFormulaRanges(formula));
  let position = 0;

  const peekOp = () => {
    const token = tokens[position];
    return token?.type === 'op' ? token.value : undefined;
  };

  const parseFactor = (): number => {
    const token = tokens[position];

    if (!token) {
      throw new Error('Incomplete tax row formula');
    }

    position += 1;

    if (token.type === 'number') return token.value;
    if (token.type === 'ref') return resolveRef(token.value);
    if (token.value === '-') return -parseFactor();
    if (token.value === '+') return parseFactor();

    if (token.value === '(') {
      const value = parseExpression();
      if (peekOp() !== ')') {
        throw new Error('Missing closing parenthesis in tax row formula');
      }
      position += 1;
      return value;
    }

    throw new Error(`Unexpected "${token.value}" in tax row formula`);
  };

  const parseTerm = (): number => {
    let value = parseFactor();

    for (let op = peekOp(); op === '*' || op === '/'; op = peekOp()) {
      position += 1;
      const operand = parseFactor();

      if (op === '/' && operand === 0) {
        throw new Error('Division by zero in tax row formula');
      }

      value = op === '*' ? value * operand : value / operand;
    }

    return value;
  };

  const parseExpression = (): number => {
    let value = parseTerm();

    for (let op = peekOp(); op === '+' || op === '-'; op = peekOp()) {
      position += 1;
      const operand = parseTerm();
      value = op === '+' ? value + operand : value - operand;
    }

    return value;
  };

  if (!tokens.length) return 0;

  const result = parseExpression();

  if (position < tokens.length) {
    throw new Error('Unexpected trailing input in tax row formula');
  }

  return result;
};

/**
 * Mirrors Erkhet's VatReportManager.calc_per_row: a row without a formula
 * shows its own posted value, a self reference reads the posted value, and any
 * other reference resolves that row's formula recursively. Title rows and
 * unknown numbers count as zero. Account formula amounts are added on top, and
 * settlement rows (with a value side) never go below zero like Erkhet's
 * plus_formula footer rows.
 */
export const calculateTaxRowValues = (
  rows: ITaxFormulaRow[],
  directValues: Map<string, number>,
  ledgerValues: Map<string, number> = new Map(),
) => {
  const rowsByNumber = new Map(
    rows.map((row) => [normalizeTaxRowNumber(row.number), row]),
  );
  const values = new Map<string, number>();
  const visiting = new Set<string>();

  const directValue = (number: string) => directValues.get(number) || 0;

  const calc = (number: string): number => {
    const row = rowsByNumber.get(number);

    if (!row || row.kind === TITLE_KIND) return 0;

    const cached = values.get(number);
    if (cached !== undefined) return cached;

    if (visiting.has(number)) {
      throw new Error(`Tax row ${number} has a circular formula reference`);
    }

    visiting.add(number);

    let value: number;
    try {
      value =
        (row.formula?.trim()
          ? evaluateTaxFormula(row.formula, (ref) =>
              ref === number ? directValue(number) : calc(ref),
            )
          : directValue(number)) + (ledgerValues.get(number) || 0);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(
        message.startsWith('Tax row ')
          ? message
          : `Tax row ${number}: ${message}`,
      );
    } finally {
      visiting.delete(number);
    }

    if (row.valueSide) value = Math.max(0, value);

    values.set(number, value);
    return value;
  };

  for (const number of rowsByNumber.keys()) {
    calc(number);
  }

  return values;
};
