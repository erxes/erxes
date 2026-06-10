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
      if (end === -1) throw new Error(`unterminated string in condition: ${src}`);
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

export function parseExpr(src: string): ExprNode {
  const tokens = tokenize(src);
  let pos = 0;

  const peek = () => tokens[pos];
  const next = () => tokens[pos++];
  const isOp = (op: string) => {
    const t = peek();
    return t?.kind === 'op' && t.op === op;
  };

  const primary = (): ExprNode => {
    const t = next();
    if (!t) throw new Error(`condition ended unexpectedly: ${src}`);
    if (t.kind === 'ref') return { kind: 'ref', path: t.path };
    if (t.kind === 'string' || t.kind === 'number' || t.kind === 'bool') {
      return { kind: 'lit', value: t.value };
    }
    if (t.kind === 'null') return { kind: 'lit', value: null };
    if (t.kind === 'lparen') {
      const inner = orExpr();
      const close = next();
      if (!close || close.kind !== 'rparen') throw new Error(`missing ")" in condition: ${src}`);
      return inner;
    }
    throw new Error(`unexpected token in condition: ${src}`);
  };

  const notExpr = (): ExprNode => {
    if (isOp('!')) {
      next();
      return { kind: 'not', operand: notExpr() };
    }
    return primary();
  };

  const cmpExpr = (): ExprNode => {
    let left = notExpr();
    const t = peek();
    if (t?.kind === 'op' && ['==', '!=', '>', '<', '>=', '<=', 'in'].includes(t.op)) {
      next();
      left = { kind: 'binary', op: t.op, left, right: notExpr() };
    }
    return left;
  };

  const andExpr = (): ExprNode => {
    let left = cmpExpr();
    while (isOp('&&')) {
      next();
      left = { kind: 'binary', op: '&&', left, right: cmpExpr() };
    }
    return left;
  };

  const orExpr = (): ExprNode => {
    let left = andExpr();
    while (isOp('||')) {
      next();
      left = { kind: 'binary', op: '||', left, right: andExpr() };
    }
    return left;
  };

  const ast = orExpr();
  if (pos < tokens.length) throw new Error(`trailing tokens in condition: ${src}`);
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
  }
}

// Loose-ish equality: LLM-authored definitions routinely compare a numeric
// field to a quoted literal, so number↔string compares coerce the string.
function looseEquals(a: any, b: any): boolean {
  if (typeof a === 'number' && typeof b === 'string') return a === Number(b);
  if (typeof a === 'string' && typeof b === 'number') return Number(a) === b;
  return a === b;
}

export function evalExpr(node: ExprNode, scope: RefScope): any {
  switch (node.kind) {
    case 'lit':
      return node.value;
    case 'ref':
      return resolveValue(`{{${node.path}}}`, scope);
    case 'not':
      return !evalExpr(node.operand, scope);
    case 'binary': {
      if (node.op === '&&') return Boolean(evalExpr(node.left, scope)) && Boolean(evalExpr(node.right, scope));
      if (node.op === '||') return Boolean(evalExpr(node.left, scope)) || Boolean(evalExpr(node.right, scope));

      const l = evalExpr(node.left, scope);
      const r = evalExpr(node.right, scope);
      switch (node.op) {
        case '==':
          return looseEquals(l, r);
        case '!=':
          return !looseEquals(l, r);
        case '>':
          return l > r;
        case '<':
          return l < r;
        case '>=':
          return l >= r;
        case '<=':
          return l <= r;
        case 'in':
          if (Array.isArray(r)) return r.some((v) => looseEquals(v, l));
          if (typeof r === 'string') return r.includes(String(l));
          if (r && typeof r === 'object') return Object.prototype.hasOwnProperty.call(r, String(l));
          return false;
        default:
          throw new Error(`unsupported operator "${node.op}"`);
      }
    }
  }
}

/** Parse + evaluate in one call (runtime path caches the AST instead). */
export function evaluateCondition(src: string, scope: RefScope): boolean {
  return Boolean(evalExpr(parseExpr(src), scope));
}
