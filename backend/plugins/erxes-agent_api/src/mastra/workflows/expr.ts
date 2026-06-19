import { RefScope, resolveValue } from './refs';

/**
 * The restricted condition language for branch steps (docs/WORKFLOW-SPEC.md
 * §4.5). Supports exactly:
 *
 *   {{ refs }}   'string' / "string"   numbers   true false null
 *   == != > < >= <=   &&  ||  !   in   ( )
 *
 * Hand-rolled recursive-descent parser + tree-walking evaluator. No Function,
 * no eval, no member access on runtime values — refs resolve data through the
 * same resolver every other step uses, so an injected customer message can
 * never become structure. When routing needs intelligence, the pattern is an
 * agent step emitting an enum, then a deterministic branch on it.
 */

type Token =
  | { kind: 'ref'; path: string }
  | { kind: 'string'; value: string }
  | { kind: 'number'; value: number }
  | { kind: 'bool'; value: boolean }
  | { kind: 'null' }
  | { kind: 'op'; op: string }
  | { kind: 'lparen' }
  | { kind: 'rparen' };

export type ExprNode =
  | { kind: 'ref'; path: string }
  | { kind: 'lit'; value: string | number | boolean | null }
  | { kind: 'not'; operand: ExprNode }
  | { kind: 'binary'; op: string; left: ExprNode; right: ExprNode };

// Dot paths only (items.0.name) — see refs.ts on why brackets are rejected.
const REF_TOKEN_RE = /^\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/;
const NUMBER_RE = /^-?\d+(\.\d+)?/;

/** Splits a condition string into the language's token stream. */
function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let rest = src;

  while (rest.length) {
    const ws = rest.match(/^\s+/);
    if (ws) {
      rest = rest.slice(ws[0].length);
      continue;
    }

    const ref = rest.match(REF_TOKEN_RE);
    if (ref) {
      tokens.push({ kind: 'ref', path: ref[1] });
      rest = rest.slice(ref[0].length);
      continue;
    }

    if (rest[0] === "'" || rest[0] === '"') {
      const quote = rest[0];
      const end = rest.indexOf(quote, 1);
      if (end === -1)
        throw new Error(`unterminated string in condition: ${src}`);
      tokens.push({ kind: 'string', value: rest.slice(1, end) });
      rest = rest.slice(end + 1);
      continue;
    }

    const num = rest.match(NUMBER_RE);
    if (num) {
      tokens.push({ kind: 'number', value: Number(num[0]) });
      rest = rest.slice(num[0].length);
      continue;
    }

    const two = rest.slice(0, 2);
    if (['==', '!=', '>=', '<=', '&&', '||'].includes(two)) {
      tokens.push({ kind: 'op', op: two });
      rest = rest.slice(2);
      continue;
    }
    if (rest[0] === '>' || rest[0] === '<' || rest[0] === '!') {
      tokens.push({ kind: 'op', op: rest[0] });
      rest = rest.slice(1);
      continue;
    }
    if (rest[0] === '(') {
      tokens.push({ kind: 'lparen' });
      rest = rest.slice(1);
      continue;
    }
    if (rest[0] === ')') {
      tokens.push({ kind: 'rparen' });
      rest = rest.slice(1);
      continue;
    }

    const word = rest.match(/^[a-zA-Z]+/);
    if (word) {
      if (word[0] === 'true') tokens.push({ kind: 'bool', value: true });
      else if (word[0] === 'false') tokens.push({ kind: 'bool', value: false });
      else if (word[0] === 'null') tokens.push({ kind: 'null' });
      else if (word[0] === 'in') tokens.push({ kind: 'op', op: 'in' });
      else throw new Error(`unknown word "${word[0]}" in condition: ${src}`);
      rest = rest.slice(word[0].length);
      continue;
    }

    throw new Error(`unexpected character "${rest[0]}" in condition: ${src}`);
  }

  return tokens;
}

/** Parses a condition string into an ExprNode AST (throws on syntax errors). */
export function parseExpr(src: string): ExprNode {
  const tokens = tokenize(src);
  let pos = 0;

  /** The current token without consuming it. */
  const peek = () => tokens[pos];
  /** Consumes and returns the current token. */
  const next = () => tokens[pos++];
  /** True when the current token is the given operator. */
  const isOp = (op: string) => {
    const token = peek();
    return token?.kind === 'op' && token.op === op;
  };

  // The grammar levels below are mutually recursive (primary → orExpr), so
  // they are hoisted function declarations rather than const arrows.

  /** Literal, ref, or parenthesized sub-expression. */
  function primary(): ExprNode {
    const token = next();
    if (!token) throw new Error(`condition ended unexpectedly: ${src}`);
    if (token.kind === 'ref') return { kind: 'ref', path: token.path };
    if (
      token.kind === 'string' ||
      token.kind === 'number' ||
      token.kind === 'bool'
    ) {
      return { kind: 'lit', value: token.value };
    }
    if (token.kind === 'null') return { kind: 'lit', value: null };
    if (token.kind === 'lparen') {
      const inner = orExpr();
      const close = next();
      if (!close || close.kind !== 'rparen')
        throw new Error(`missing ")" in condition: ${src}`);
      return inner;
    }
    throw new Error(`unexpected token in condition: ${src}`);
  }

  /** Unary `!` chains. */
  function notExpr(): ExprNode {
    if (isOp('!')) {
      next();
      return { kind: 'not', operand: notExpr() };
    }
    return primary();
  }

  /** One optional comparison (== != > < >= <= in). */
  function cmpExpr(): ExprNode {
    let left = notExpr();
    const token = peek();
    if (
      token?.kind === 'op' &&
      ['==', '!=', '>', '<', '>=', '<=', 'in'].includes(token.op)
    ) {
      next();
      left = { kind: 'binary', op: token.op, left, right: notExpr() };
    }
    return left;
  }

  /** Left-associative `&&` chains. */
  function andExpr(): ExprNode {
    let left = cmpExpr();
    while (isOp('&&')) {
      next();
      left = { kind: 'binary', op: '&&', left, right: cmpExpr() };
    }
    return left;
  }

  /** Left-associative `||` chains (lowest precedence). */
  function orExpr(): ExprNode {
    let left = andExpr();
    while (isOp('||')) {
      next();
      left = { kind: 'binary', op: '||', left, right: andExpr() };
    }
    return left;
  }

  const ast = orExpr();
  if (pos < tokens.length)
    throw new Error(`trailing tokens in condition: ${src}`);
  return ast;
}

/** Refs used by an expression — fed into the same compile-time checkRef pass. */
export function exprRefs(node: ExprNode): string[] {
  switch (node.kind) {
    case 'ref':
      return [node.path];
    case 'lit':
      return [];
    case 'not':
      return exprRefs(node.operand);
    case 'binary':
      return [...exprRefs(node.left), ...exprRefs(node.right)];
    default:
      // ExprNode is exhaustive; unknown kinds carry no refs.
      return [];
  }
}

// Loose-ish equality: LLM-authored definitions routinely compare a numeric
// field to a quoted literal, so number↔string compares coerce the string.
function looseEquals(a: unknown, b: unknown): boolean {
  if (typeof a === 'number' && typeof b === 'string') return a === Number(b);
  if (typeof a === 'string' && typeof b === 'number') return Number(a) === b;
  return a === b;
}

/** Evaluates a parsed condition AST against the runtime ref scope. */
export function evalExpr(node: ExprNode, scope: RefScope): unknown {
  switch (node.kind) {
    case 'lit':
      return node.value;
    case 'ref':
      return resolveValue(`{{${node.path}}}`, scope);
    case 'not':
      return !evalExpr(node.operand, scope);
    case 'binary': {
      if (node.op === '&&')
        return (
          Boolean(evalExpr(node.left, scope)) &&
          Boolean(evalExpr(node.right, scope))
        );
      if (node.op === '||')
        return (
          Boolean(evalExpr(node.left, scope)) ||
          Boolean(evalExpr(node.right, scope))
        );

      const leftVal = evalExpr(node.left, scope);
      const rightVal = evalExpr(node.right, scope);
      switch (node.op) {
        case '==':
          return looseEquals(leftVal, rightVal);
        case '!=':
          return !looseEquals(leftVal, rightVal);
        case '>':
          return (leftVal as number) > (rightVal as number);
        case '<':
          return (leftVal as number) < (rightVal as number);
        case '>=':
          return (leftVal as number) >= (rightVal as number);
        case '<=':
          return (leftVal as number) <= (rightVal as number);
        case 'in':
          if (Array.isArray(rightVal))
            return rightVal.some((member) => looseEquals(member, leftVal));
          if (typeof rightVal === 'string')
            return rightVal.includes(String(leftVal));
          if (rightVal && typeof rightVal === 'object')
            return Object.prototype.hasOwnProperty.call(
              rightVal,
              String(leftVal),
            );
          return false;
        default:
          throw new Error(`unsupported operator "${node.op}"`);
      }
    }
    default:
      // ExprNode is exhaustive; an unknown kind evaluates to undefined.
      return undefined;
  }
}

/** Parse + evaluate in one call (runtime path caches the AST instead). */
export function evaluateCondition(src: string, scope: RefScope): boolean {
  return Boolean(evalExpr(parseExpr(src), scope));
}
