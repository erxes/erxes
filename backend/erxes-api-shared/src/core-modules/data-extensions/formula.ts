/**
 * Formula fields: a small expression language evaluated on read. There is
 * no `eval`: expressions are parsed into a tree once and evaluated against
 * one record's values, with bounded length, depth and work.
 *
 *   {value} * 1.1
 *   IF({status} == "signed", {value}, 0)
 *   DAYS({startsAt}, {endsAt})
 *   CONCAT({city}, ", ", {country})
 */

export const FORMULA_LIMITS = {
  length: 500,
  depth: 20,
  nodes: 200,
} as const;

export const FORMULA_RESULT_TYPES = ['number', 'text', 'date', 'boolean'] as const;

export type FormulaResultType = (typeof FORMULA_RESULT_TYPES)[number];

type FormulaValue = number | string | boolean | Date | null;

type Node =
  | { kind: 'number'; value: number }
  | { kind: 'string'; value: string }
  | { kind: 'boolean'; value: boolean }
  | { kind: 'field'; key: string }
  | { kind: 'unary'; op: '-' | '!'; arg: Node }
  | { kind: 'binary'; op: string; left: Node; right: Node }
  | { kind: 'call'; name: string; args: Node[] };

export class FormulaError extends Error {}

const FUNCTIONS: Record<string, [number, number]> = {
  IF: [3, 3],
  ROUND: [1, 2],
  ABS: [1, 1],
  MIN: [1, 20],
  MAX: [1, 20],
  DAYS: [2, 2],
  TODAY: [0, 0],
  CONCAT: [1, 20],
  LEN: [1, 1],
  UPPER: [1, 1],
  LOWER: [1, 1],
  ISEMPTY: [1, 1],
  COALESCE: [2, 20],
};

const PRECEDENCE: Record<string, number> = {
  '||': 1,
  '&&': 2,
  '==': 3,
  '!=': 3,
  '<': 4,
  '<=': 4,
  '>': 4,
  '>=': 4,
  '+': 5,
  '-': 5,
  '*': 6,
  '/': 6,
  '%': 6,
};

type Token =
  | { type: 'number'; value: number }
  | { type: 'string'; value: string }
  | { type: 'field'; value: string }
  | { type: 'name'; value: string }
  | { type: 'op'; value: string }
  | { type: 'punct'; value: '(' | ')' | ',' };

const tokenize = (source: string): Token[] => {
  const tokens: Token[] = [];
  let index = 0;

  while (index < source.length) {
    const char = source[index];

    if (/\s/.test(char)) {
      index++;
      continue;
    }

    if (/[0-9.]/.test(char)) {
      const match = /^[0-9]*\.?[0-9]+(e[+-]?[0-9]+)?/i.exec(source.slice(index));

      if (!match) {
        throw new FormulaError(`Unexpected "${char}"`);
      }

      tokens.push({ type: 'number', value: Number(match[0]) });
      index += match[0].length;
      continue;
    }

    if (char === '"') {
      let value = '';
      index++;

      while (index < source.length && source[index] !== '"') {
        if (source[index] === '\\' && index + 1 < source.length) {
          index++;
        }

        value += source[index++];
      }

      if (source[index] !== '"') {
        throw new FormulaError('A text value is missing its closing quote');
      }

      index++;
      tokens.push({ type: 'string', value });
      continue;
    }

    if (char === '{') {
      const end = source.indexOf('}', index);
      const key = end > index ? source.slice(index + 1, end).trim() : '';

      if (!/^[a-z][a-zA-Z0-9]{0,62}$/.test(key)) {
        throw new FormulaError('Field references look like {fieldKey}');
      }

      tokens.push({ type: 'field', value: key });
      index = end + 1;
      continue;
    }

    if (/[A-Za-z_]/.test(char)) {
      const match = /^[A-Za-z_][A-Za-z0-9_]*/.exec(source.slice(index)) as RegExpExecArray;

      tokens.push({ type: 'name', value: match[0] });
      index += match[0].length;
      continue;
    }

    const two = source.slice(index, index + 2);

    if (['==', '!=', '<=', '>=', '&&', '||'].includes(two)) {
      tokens.push({ type: 'op', value: two });
      index += 2;
      continue;
    }

    if ('+-*/%<>!'.includes(char)) {
      tokens.push({ type: 'op', value: char });
      index++;
      continue;
    }

    if ('(),'.includes(char)) {
      tokens.push({ type: 'punct', value: char as '(' | ')' | ',' });
      index++;
      continue;
    }

    throw new FormulaError(`Unexpected "${char}"`);
  }

  return tokens;
};

/** Parses an expression; throws a FormulaError that says what is wrong. */
export const parseFormula = (source: string): Node => {
  if (typeof source !== 'string' || !source.trim()) {
    throw new FormulaError('Write an expression');
  }

  if (source.length > FORMULA_LIMITS.length) {
    throw new FormulaError(`Keep formulas under ${FORMULA_LIMITS.length} characters`);
  }

  const tokens = tokenize(source);
  let position = 0;
  let nodes = 0;

  const count = <T extends Node>(node: T): T => {
    if (++nodes > FORMULA_LIMITS.nodes) {
      throw new FormulaError('This formula is too long');
    }

    return node;
  };

  const peek = () => tokens[position];
  const expectPunct = (value: string) => {
    const token = tokens[position++];

    if (!token || token.type !== 'punct' || token.value !== value) {
      throw new FormulaError(`Expected "${value}"`);
    }
  };

  const parsePrimary = (depth: number): Node => {
    if (depth > FORMULA_LIMITS.depth) {
      throw new FormulaError('This formula is nested too deeply');
    }

    const token = tokens[position++];

    if (!token) {
      throw new FormulaError('The formula ends too early');
    }

    switch (token.type) {
      case 'number':
        return count({ kind: 'number', value: token.value });
      case 'string':
        return count({ kind: 'string', value: token.value });
      case 'field':
        return count({ kind: 'field', key: token.value });
      case 'op':
        if (token.value === '-' || token.value === '!') {
          return count({ kind: 'unary', op: token.value, arg: parsePrimary(depth + 1) });
        }
        throw new FormulaError(`Unexpected "${token.value}"`);
      case 'punct':
        if (token.value === '(') {
          const inner = parseExpression(0, depth + 1);

          expectPunct(')');
          return inner;
        }
        throw new FormulaError(`Unexpected "${token.value}"`);
      case 'name': {
        const name = token.value.toUpperCase();

        if (name === 'TRUE' || name === 'FALSE') {
          return count({ kind: 'boolean', value: name === 'TRUE' });
        }

        const arity = FUNCTIONS[name];

        if (!arity) {
          throw new FormulaError(`Unknown function ${token.value}`);
        }

        expectPunct('(');

        const args: Node[] = [];

        if (!(peek()?.type === 'punct' && peek()?.value === ')')) {
          args.push(parseExpression(0, depth + 1));

          while (peek()?.type === 'punct' && peek()?.value === ',') {
            position++;
            args.push(parseExpression(0, depth + 1));
          }
        }

        expectPunct(')');

        if (args.length < arity[0] || args.length > arity[1]) {
          throw new FormulaError(`${name} takes ${arity[0] === arity[1] ? arity[0] : `${arity[0]} to ${arity[1]}`} values`);
        }

        return count({ kind: 'call', name, args });
      }
    }
  };

  const parseExpression = (minPrecedence: number, depth: number): Node => {
    let left = parsePrimary(depth);

    for (;;) {
      const token = peek();

      if (!token || token.type !== 'op' || !(token.value in PRECEDENCE)) {
        return left;
      }

      const precedence = PRECEDENCE[token.value];

      if (precedence < minPrecedence) {
        return left;
      }

      position++;

      const right = parseExpression(precedence + 1, depth + 1);

      left = count({ kind: 'binary', op: token.value, left, right });
    }
  };

  const tree = parseExpression(0, 0);

  if (position < tokens.length) {
    throw new FormulaError(`Unexpected "${String(tokens[position].value)}"`);
  }

  return tree;
};

/** Field keys a formula reads, to check they exist and are not formulas. */
export const formulaFieldKeys = (tree: Node): string[] => {
  const keys = new Set<string>();
  const visit = (node: Node) => {
    if (node.kind === 'field') keys.add(node.key);
    if (node.kind === 'unary') visit(node.arg);
    if (node.kind === 'binary') {
      visit(node.left);
      visit(node.right);
    }
    if (node.kind === 'call') node.args.forEach(visit);
  };

  visit(tree);

  return Array.from(keys);
};

const DAY_MS = 86400000;

const asNumber = (value: FormulaValue): number | null => {
  if (value === null || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (value instanceof Date) return value.getTime();
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const asText = (value: FormulaValue) =>
  value === null ? '' : value instanceof Date ? value.toISOString() : String(value);

const asDate = (value: FormulaValue): Date | null => {
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
};

const truthy = (value: FormulaValue) =>
  value !== null && value !== false && value !== 0 && value !== '';

/**
 * A stored value as a formula input: currency becomes its amount, lists
 * their length, composite objects their text, so expressions stay simple.
 */
export const formulaInput = (value: unknown): FormulaValue => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' || typeof value === 'boolean' || value instanceof Date) return value;
  if (typeof value === 'string') {
    return /^\d{4}-\d{2}-\d{2}T/.test(value) ? new Date(value) : value;
  }
  if (Array.isArray(value)) return value.length;
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;

    if (typeof record.amount === 'number') return record.amount;

    return Object.values(record).filter((part) => typeof part === 'string').join(' ');
  }
  return null;
};

/** Evaluates a parsed formula; any runtime problem yields null, never a throw. */
export const evaluateFormula = (
  tree: Node,
  values: Record<string, unknown>,
  now: () => Date = () => new Date(),
): FormulaValue => {
  let steps = 0;

  const run = (node: Node): FormulaValue => {
    if (++steps > FORMULA_LIMITS.nodes * 4) {
      throw new FormulaError('Too much work');
    }

    switch (node.kind) {
      case 'number':
      case 'string':
      case 'boolean':
        return node.value;
      case 'field':
        return formulaInput(values[node.key]);
      case 'unary': {
        const arg = run(node.arg);
        if (node.op === '!') return !truthy(arg);
        const number = asNumber(arg);
        return number === null ? null : -number;
      }
      case 'binary': {
        if (node.op === '&&') return truthy(run(node.left)) && truthy(run(node.right));
        if (node.op === '||') return truthy(run(node.left)) || truthy(run(node.right));

        const left = run(node.left);
        const right = run(node.right);

        if (node.op === '==' || node.op === '!=') {
          const same =
            left instanceof Date || right instanceof Date
              ? asDate(left)?.getTime() === asDate(right)?.getTime()
              : left === right || (typeof left === 'number' || typeof right === 'number'
                  ? asNumber(left) === asNumber(right)
                  : false);

          return node.op === '==' ? same : !same;
        }

        if (node.op === '+' && (typeof left === 'string' || typeof right === 'string')) {
          return `${asText(left)}${asText(right)}`;
        }

        if (node.op === '+' && left instanceof Date) {
          const days = asNumber(right);
          return days === null ? null : new Date(left.getTime() + days * DAY_MS);
        }

        const a = asNumber(left);
        const b = asNumber(right);

        if (a === null || b === null) return null;

        switch (node.op) {
          case '+': return a + b;
          case '-': return a - b;
          case '*': return a * b;
          case '/': return b === 0 ? null : a / b;
          case '%': return b === 0 ? null : a % b;
          case '<': return a < b;
          case '<=': return a <= b;
          case '>': return a > b;
          case '>=': return a >= b;
          default: return null;
        }
      }
      case 'call': {
        const args = node.args;

        switch (node.name) {
          case 'IF':
            return truthy(run(args[0])) ? run(args[1]) : run(args[2]);
          case 'ROUND': {
            const value = asNumber(run(args[0]));
            const digits = args[1] ? Math.min(Math.max(asNumber(run(args[1])) ?? 0, 0), 10) : 0;
            return value === null ? null : Math.round(value * 10 ** digits) / 10 ** digits;
          }
          case 'ABS': {
            const value = asNumber(run(args[0]));
            return value === null ? null : Math.abs(value);
          }
          case 'MIN':
          case 'MAX': {
            const numbers = args.map((arg) => asNumber(run(arg))).filter((n): n is number => n !== null);
            return numbers.length ? (node.name === 'MIN' ? Math.min(...numbers) : Math.max(...numbers)) : null;
          }
          case 'DAYS': {
            const from = asDate(run(args[0]));
            const to = asDate(run(args[1]));
            return from && to ? Math.round((to.getTime() - from.getTime()) / DAY_MS) : null;
          }
          case 'TODAY':
            return now();
          case 'CONCAT':
            return args.map((arg) => asText(run(arg))).join('');
          case 'LEN':
            return asText(run(args[0])).length;
          case 'UPPER':
            return asText(run(args[0])).toUpperCase();
          case 'LOWER':
            return asText(run(args[0])).toLowerCase();
          case 'ISEMPTY':
            return !truthy(run(args[0]));
          case 'COALESCE': {
            for (const arg of args) {
              const value = run(arg);
              if (value !== null && value !== '') return value;
            }
            return null;
          }
          default:
            return null;
        }
      }
    }
  };

  try {
    return run(tree);
  } catch {
    return null;
  }
};

/** The result in the field's declared type, or null when it does not fit. */
export const castFormulaResult = (
  value: FormulaValue,
  type: FormulaResultType,
): number | string | boolean | null => {
  switch (type) {
    case 'number': {
      const number = asNumber(value instanceof Date ? null : value);
      return number === null ? null : number;
    }
    case 'boolean':
      return value === null ? null : truthy(value);
    case 'date': {
      const date = asDate(value);
      return date ? date.toISOString() : null;
    }
    default:
      return value === null ? null : asText(value);
  }
};
