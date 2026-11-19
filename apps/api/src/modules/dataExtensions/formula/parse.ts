/**
 * Formulas: a small expression language, parsed into a tree that `compile.ts` turns into SQL.
 * There is no `eval`; length, nesting and size are bounded.
 *
 *   {amount} * 1.1
 *   IF({stage} == "won", {amount}, 0)
 *   DAYS({startsAt}, TODAY())
 *   CONCAT({client.primaryName}, " – ", {name})
 */

const FORMULA_LIMITS = { length: 1000, depth: 20, nodes: 300 } as const;

export type BinaryOp =
  | '||'
  | '&&'
  | '=='
  | '!='
  | '<'
  | '<='
  | '>'
  | '>='
  | '+'
  | '-'
  | '*'
  | '/'
  | '%';

export type FormulaNode =
  | { kind: 'number'; value: number; at: number }
  | { kind: 'text'; value: string; at: number }
  | { kind: 'boolean'; value: boolean; at: number }
  | { kind: 'null'; at: number }
  | { kind: 'field'; path: string[]; at: number }
  | { kind: 'unary'; op: '-' | '!'; arg: FormulaNode; at: number }
  | { kind: 'binary'; op: BinaryOp; left: FormulaNode; right: FormulaNode; at: number }
  | { kind: 'call'; name: string; args: FormulaNode[]; at: number };

/** A formula that can't be read or used; `at` is the character it is about. */
export class FormulaError extends Error {
  constructor(
    message: string,
    readonly at: number,
  ) {
    super(message);
  }
}

type Token =
  | { kind: 'number'; value: number; at: number }
  | { kind: 'text'; value: string; at: number }
  | { kind: 'field'; path: string[]; at: number }
  | { kind: 'name'; value: string; at: number }
  | { kind: 'op'; value: string; at: number }
  | { kind: 'end'; at: number };

const OPERATORS = [
  '==',
  '!=',
  '<>',
  '<=',
  '>=',
  '&&',
  '||',
  '<',
  '>',
  '=',
  '+',
  '-',
  '*',
  '/',
  '%',
  '!',
  '(',
  ')',
  ',',
];

/** `=` and `<>` as spreadsheets write them. */
const ALIASES: Record<string, string> = { '=': '==', '<>': '!=' };

const PATH = /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*){0,2}$/;

const readText = (source: string, start: number): [string, number] => {
  const quote = source[start];
  let value = '';
  let i = start + 1;

  while (i < source.length && source[i] !== quote) {
    if (source[i] === '\\' && i + 1 < source.length) {
      const next = source[i + 1] ?? '';

      value += next === 'n' ? '\n' : next;
      i += 2;
    } else {
      value += source[i];
      i += 1;
    }
  }

  if (i >= source.length) throw new FormulaError('This text has no closing quote', start);

  return [value, i + 1];
};

const readField = (source: string, start: number): [string[], number] => {
  const close = source.indexOf('}', start);

  if (close < 0) throw new FormulaError('This field has no closing }', start);

  const path = source.slice(start + 1, close).trim();

  if (!PATH.test(path)) throw new FormulaError(`{${path}} is not a field name`, start);

  return [path.split('.'), close + 1];
};

const tokenize = (source: string): Token[] => {
  const tokens: Token[] = [];
  let i = 0;

  while (i < source.length) {
    const char = source[i] ?? '';
    const rest = source.slice(i);

    if (/\s/.test(char)) {
      i += 1;
    } else if (/[0-9]/.test(char) || (char === '.' && /^\.[0-9]/.test(rest))) {
      const [match = ''] = /^[0-9]*\.?[0-9]+(e[+-]?[0-9]+)?/i.exec(rest) ?? [];

      tokens.push({ kind: 'number', value: Number(match), at: i });
      i += match.length;
    } else if (char === '"' || char === "'") {
      const [value, next] = readText(source, i);

      tokens.push({ kind: 'text', value, at: i });
      i = next;
    } else if (char === '{') {
      const [path, next] = readField(source, i);

      tokens.push({ kind: 'field', path, at: i });
      i = next;
    } else if (/[A-Za-z_]/.test(char)) {
      const [match = ''] = /^[A-Za-z_][A-Za-z0-9_]*/.exec(rest) ?? [];

      tokens.push({ kind: 'name', value: match.toUpperCase(), at: i });
      i += match.length;
    } else {
      const op = OPERATORS.find((candidate) => rest.startsWith(candidate));

      if (!op) throw new FormulaError(`${char} has no meaning here`, i);

      tokens.push({ kind: 'op', value: ALIASES[op] ?? op, at: i });
      i += op.length;
    }
  }

  tokens.push({ kind: 'end', at: source.length });

  return tokens;
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

const isBinaryOp = (value: string): value is BinaryOp => value in PRECEDENCE;

/** Words that read as operators: `AND`, `OR` (and `NOT`, in `unary`). */
const WORD_OPS: Record<string, BinaryOp> = { AND: '&&', OR: '||' };

const isOp = (token: Token, value: string) => token.kind === 'op' && token.value === value;

class Parser {
  private index = 0;
  private nodes = 0;

  constructor(private readonly tokens: Token[]) {}

  private peek(): Token {
    return this.tokens[this.index] ?? { kind: 'end', at: 0 };
  }

  private take(): Token {
    const token = this.peek();

    this.index += 1;

    return token;
  }

  private expect(value: string) {
    const token = this.take();

    if (!isOp(token, value)) throw new FormulaError(`Expected ${value}`, token.at);
  }

  private count(depth: number, at: number) {
    this.nodes += 1;

    if (this.nodes > FORMULA_LIMITS.nodes) throw new FormulaError('The formula is too long', at);

    if (depth > FORMULA_LIMITS.depth) throw new FormulaError('The formula nests too deep', at);
  }

  private binaryOp(): BinaryOp | null {
    const token = this.peek();

    if (token.kind === 'op' && isBinaryOp(token.value)) return token.value;

    return token.kind === 'name' ? (WORD_OPS[token.value] ?? null) : null;
  }

  parse(): FormulaNode {
    const node = this.expression(0, 0);
    const token = this.peek();

    if (token.kind !== 'end') throw new FormulaError('Expected the formula to end here', token.at);

    return node;
  }

  private expression(minimum: number, depth: number): FormulaNode {
    let left = this.unary(depth);

    for (let op = this.binaryOp(); op && (PRECEDENCE[op] ?? 0) > minimum; op = this.binaryOp()) {
      const { at } = this.take();

      this.count(depth, at);

      const right = this.expression(PRECEDENCE[op] ?? 0, depth + 1);

      left = { kind: 'binary', op, left, right, at };
    }

    return left;
  }

  private unary(depth: number): FormulaNode {
    const token = this.peek();
    const isNot = token.kind === 'name' && token.value === 'NOT' && !this.callFollows();

    if (isOp(token, '-') || isOp(token, '!') || isNot) {
      this.take();
      this.count(depth, token.at);

      const op = isOp(token, '-') ? '-' : '!';

      return { kind: 'unary', op, arg: this.unary(depth + 1), at: token.at };
    }

    return this.primary(depth);
  }

  private callFollows() {
    const next = this.tokens[this.index + 1];

    return next !== undefined && isOp(next, '(');
  }

  private primary(depth: number): FormulaNode {
    const token = this.take();

    this.count(depth, token.at);

    switch (token.kind) {
      case 'number':
      case 'text':
        return token;
      case 'field':
        return token;
      case 'name':
        return this.named(token, depth);
      case 'op':
        if (token.value === '(') {
          const inner = this.expression(0, depth + 1);

          this.expect(')');

          return inner;
        }

        throw new FormulaError(`${token.value} can't start a value`, token.at);
      case 'end':
        throw new FormulaError('The formula ends too soon', token.at);
    }
  }

  private named(token: { value: string; at: number }, depth: number): FormulaNode {
    const { value, at } = token;
    // The name is taken, so a call's `(` is the next token.
    const call = isOp(this.peek(), '(');

    if (!call && (value === 'TRUE' || value === 'FALSE')) {
      return { kind: 'boolean', value: value === 'TRUE', at };
    }

    if (!call && value === 'NULL') return { kind: 'null', at };

    if (!call) {
      throw new FormulaError(
        `${value} is not a function: write {${value.toLowerCase()}} for a field`,
        at,
      );
    }

    this.expect('(');

    const args: FormulaNode[] = [];

    if (!isOp(this.peek(), ')')) {
      args.push(this.expression(0, depth + 1));

      while (isOp(this.peek(), ',')) {
        this.take();
        args.push(this.expression(0, depth + 1));
      }
    }

    this.expect(')');

    return { kind: 'call', name: value, args, at };
  }
}

/** The formula's tree, or FormulaError naming what is wrong and where. */
export const parseFormula = (source: string): FormulaNode => {
  if (source.length > FORMULA_LIMITS.length) {
    throw new FormulaError(`A formula has at most ${FORMULA_LIMITS.length} characters`, 0);
  }

  return new Parser(tokenize(source)).parse();
};
