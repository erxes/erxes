import type { DataResultType } from '@erxes/core-db';
import { type SQL, sql } from 'drizzle-orm';
import { FUNCTIONS } from './functions';
import { type BinaryOp, FormulaError, type FormulaNode } from './parse';
import { as, need, type Typed, unify } from './types';

/**
 * A formula's tree as SQL over one record's columns, type-checked as it goes, so a list can
 * filter and sort by the result. Nothing in it can fail as the query runs: division by zero
 * and the like give null, and numbers that become counts are clamped.
 */

/** A field's value as SQL of its type, for `{path}`. */
export type ResolveField = (path: string[], at: number) => Promise<Typed>;

const ARITHMETIC: Partial<Record<BinaryOp, (a: SQL, b: SQL) => SQL>> = {
  '+': (a, b) => sql`(${a} + ${b})`,
  '-': (a, b) => sql`(${a} - ${b})`,
  '*': (a, b) => sql`(${a} * ${b})`,
  '/': (a, b) => sql`(${a} / nullif(${b}, 0))`,
  '%': (a, b) => sql`mod(${a}, nullif(${b}, 0))`,
};

const binary = (op: BinaryOp, left: Typed, right: Typed, at: number): Typed => {
  const arithmetic = ARITHMETIC[op];

  if (arithmetic) {
    need(left, ['number'], at, op);
    need(right, ['number'], at, op);

    return { sql: arithmetic(as(left, 'number'), as(right, 'number')), type: 'number' };
  }

  if (op === '&&' || op === '||') {
    need(left, ['boolean'], at, op);
    need(right, ['boolean'], at, op);

    const word = sql.raw(op === '&&' ? 'and' : 'or');

    return { sql: sql`(${as(left, 'boolean')} ${word} ${as(right, 'boolean')})`, type: 'boolean' };
  }

  const type = unify([left, right], at, op);

  if (op === '==' || op === '!=') {
    const word = sql.raw(op === '==' ? 'is not distinct from' : 'is distinct from');

    return { sql: sql`(${as(left, type)} ${word} ${as(right, type)})`, type: 'boolean' };
  }

  if (type === 'boolean') throw new FormulaError(`${op} compares numbers, text and dates`, at);

  return { sql: sql`(${as(left, type)} ${sql.raw(op)} ${as(right, type)})`, type: 'boolean' };
};

const literal = (node: FormulaNode): Typed | null => {
  switch (node.kind) {
    case 'number':
      if (!Number.isFinite(node.value)) throw new FormulaError('This number is too big', node.at);

      return { sql: sql`${String(node.value)}::numeric`, type: 'number' };
    case 'text':
      return { sql: sql`${node.value}::text`, type: 'text' };
    case 'boolean':
      return { sql: sql.raw(node.value ? 'true' : 'false'), type: 'boolean' };
    case 'null':
      return { sql: sql`null`, type: 'null' };
    default:
      return null;
  }
};

const call = async (
  node: Extract<FormulaNode, { kind: 'call' }>,
  field: ResolveField,
): Promise<Typed> => {
  const fn = FUNCTIONS[node.name];

  if (!fn) throw new FormulaError(`${node.name} is not a function`, node.at);

  const [min, max] = fn.args;

  if (node.args.length < min || node.args.length > max) {
    const count = min === max ? `${min}` : `${min} to ${max}`;

    throw new FormulaError(`${node.name} takes ${count} values`, node.at);
  }

  const args = await Promise.all(node.args.map((arg) => compileFormula(arg, field)));

  return fn.build(args, node.at);
};

/** The formula as typed SQL; `field` resolves each `{path}`. */
export const compileFormula = async (node: FormulaNode, field: ResolveField): Promise<Typed> => {
  const constant = literal(node);

  if (constant) return constant;

  switch (node.kind) {
    case 'field':
      return field(node.path, node.at);
    case 'unary': {
      const arg = await compileFormula(node.arg, field);

      need(arg, [node.op === '-' ? 'number' : 'boolean'], node.at, node.op);

      return node.op === '-'
        ? { sql: sql`(- ${as(arg, 'number')})`, type: 'number' }
        : { sql: sql`(not ${as(arg, 'boolean')})`, type: 'boolean' };
    }

    case 'binary': {
      const [left, right] = await Promise.all([
        compileFormula(node.left, field),
        compileFormula(node.right, field),
      ]);

      return binary(node.op, left, right, node.at);
    }

    case 'call':
      return call(node, field);
    default:
      throw new FormulaError('This is not a value', node.at);
  }
};

/** The result as SQL of its type, a bare NULL as text. */
export const resultOf = (value: Typed): { sql: SQL; type: DataResultType } =>
  value.type === 'null'
    ? { sql: sql`null::text`, type: 'text' }
    : { sql: value.sql, type: value.type };
