// What one field holds and whether it may be missing, read from a zod schema, a table column or a
// hand-written type, so check-copies compares fields and not just their names.
import type { Expression, ObjectExpression, PropertyKey, TSSignature, TSType } from 'oxc-parser';

/** What a field holds, as far as its source tells; null when it can't. */
export type Kind = 'string' | 'number' | 'boolean' | 'enum' | null;

/**
 * A field's kind, whether it may be missing (`?`) and whether it may be null; null where the
 * source can't tell. `ref` names the zod schema a field reuses (`price: Money`), which
 * check-copies resolves across files.
 */
export interface Field {
  kind: Kind;
  optional: boolean | null;
  nullable: boolean | null;
  ref?: string;
}

const UNKNOWN: Field = { kind: null, optional: null, nullable: null };

export type Fields = Map<string, Field>;

const ZOD_KINDS: Record<string, Kind> = {
  string: 'string',
  email: 'string',
  url: 'string',
  uuid: 'string',
  enum: 'enum',
  literal: 'enum',
  number: 'number',
  int: 'number',
  boolean: 'boolean',
};

const COLUMN_KINDS: Record<string, Kind> = {
  text: 'string',
  varchar: 'string',
  char: 'string',
  uuid: 'string',
  // Drizzle's date() reads as a YYYY-MM-DD string unless mode is 'date'.
  date: 'string',
  integer: 'number',
  smallint: 'number',
  real: 'number',
  doublePrecision: 'number',
  boolean: 'boolean',
};

/**
 * A call chain read from its first call: `z.string().min(1).nullable()` is `z.string` then `min`
 * and `nullable`, `text('x').notNull()` is `text` then `notNull`, `Money.optional()` is `Money`
 * then `optional`. `owner` is null for a bare function and `name` null for a bare identifier.
 */
const readChain = (node: Expression) => {
  const calls = new Set<string>();
  let current = node;

  while (current.type === 'CallExpression') {
    const { callee } = current;

    if (callee.type === 'Identifier') return { owner: null, name: callee.name, calls };

    if (callee.type !== 'MemberExpression' || callee.property.type !== 'Identifier') return null;

    const { object, property } = callee;

    if (object.type === 'Identifier') return { owner: object.name, name: property.name, calls };

    // z.coerce.number() reads as z.number().
    if (
      object.type === 'MemberExpression' &&
      object.object.type === 'Identifier' &&
      object.object.name === 'z'
    ) {
      return { owner: 'z', name: property.name, calls };
    }

    calls.add(property.name);
    current = object;
  }

  return current.type === 'Identifier' ? { owner: current.name, name: null, calls } : null;
};

/** What `.optional()`, `.nullable()`, `.nullish()` and `.default()` in a zod chain tell. */
const zodFlags = (calls: Set<string>) => {
  const has = (...names: string[]) => names.some((name) => calls.has(name));
  const defaulted = has('default', 'catch', 'prefault');

  return {
    optional: has('optional', 'nullish') || (defaulted ? null : false),
    nullable: has('nullable', 'nullish'),
  };
};

/** A zod schema's field; a value that is no zod chain tells nothing. */
export const zodField = (node: Expression): Field => {
  const chain = readChain(node);

  if (!chain) return UNKNOWN;

  // A schema factory: `OptionalText(200)`, which check-copies resolves like a schema.
  if (!chain.owner) {
    return chain.name ? { kind: null, optional: null, nullable: null, ref: chain.name } : UNKNOWN;
  }

  if (chain.owner === 'z' && chain.name) {
    const kind = chain.calls.has('array') ? null : (ZOD_KINDS[chain.name] ?? null);

    return { kind, ...zodFlags(chain.calls) };
  }

  // Another schema, maybe with modifiers: `Money` or `Money.optional()`. What a modifier
  // doesn't say comes from that schema.
  if (chain.name) chain.calls.add(chain.name);

  const { optional, nullable } = zodFlags(chain.calls);

  return {
    kind: null,
    optional: optional === true ? true : null,
    nullable: nullable ? true : null,
    ref: chain.owner,
  };
};

/** The first call of a chain: `text({ enum })` in `text({ enum }).notNull()`. */
const firstCall = (node: Expression): Expression =>
  node.type === 'CallExpression' &&
  node.callee.type === 'MemberExpression' &&
  node.callee.object.type === 'CallExpression'
    ? firstCall(node.callee.object)
    : node;

/** A column's option: `KINDS` in `text({ enum: KINDS })`, `'date'` in `date({ mode: 'date' })`. */
const columnOption = (node: Expression, key: string) => {
  const call = firstCall(node);

  if (call.type !== 'CallExpression') return undefined;

  return call.arguments
    .flatMap((argument) => (argument.type === 'ObjectExpression' ? argument.properties : []))
    .find((property) => property.type === 'Property' && keyName(property.key) === key);
};

const columnKind = (node: Expression, kind: Kind) => {
  if (kind === 'string' && columnOption(node, 'enum')) return 'enum';

  const mode = columnOption(node, 'mode');

  // A mode other than 'string' reads as a Date or a number.
  return mode?.type === 'Property' &&
    !(mode.value.type === 'Literal' && mode.value.value === 'string')
    ? null
    : kind;
};

/** Fields with each `ref` the lookup knows replaced by that schema's kind and optionality. */
export const resolveRefs = (fields: Fields, lookup: (ref: string) => Field | null | undefined) =>
  new Map(
    [...fields].map(([name, field]) => {
      const schema = field.ref ? lookup(field.ref) : null;

      return [
        name,
        schema
          ? {
              kind: schema.kind,
              optional: field.optional ?? schema.optional,
              nullable: field.nullable ?? schema.nullable,
            }
          : field,
      ];
    }),
  );

/** A column's field; a helper column (`id()`, `orgId()`) tells nothing, nor does `$type`. */
export const columnField = (node: Expression): Field => {
  const chain = readChain(node);
  const kind = chain && !chain.owner && chain.name ? COLUMN_KINDS[chain.name] : undefined;

  if (!chain || kind === undefined) return UNKNOWN;

  const known = !chain.calls.has('array') && !chain.calls.has('$type');

  return {
    kind: known ? columnKind(node, kind) : null,
    optional: false,
    nullable: !chain.calls.has('notNull') && !chain.calls.has('primaryKey'),
  };
};

const literalKind = (value: unknown): Kind => {
  if (typeof value === 'string') return 'enum';

  if (typeof value === 'number') return 'number';

  return typeof value === 'boolean' ? 'boolean' : null;
};

const isNothing = (type: TSType) =>
  type.type === 'TSNullKeyword' || type.type === 'TSUndefinedKeyword';

const unionHas = (type: TSType | undefined, part: TSType['type']) =>
  type?.type === 'TSUnionType' && type.types.some((member) => member.type === part);

const typeKind = (type: TSType): Kind => {
  switch (type.type) {
    case 'TSStringKeyword':
      return 'string';
    case 'TSNumberKeyword':
      return 'number';
    case 'TSBooleanKeyword':
      return 'boolean';
    case 'TSLiteralType':
      return 'value' in type.literal ? literalKind(type.literal.value) : null;
    case 'TSUnionType': {
      const kinds = new Set(type.types.filter((part) => !isNothing(part)).map(typeKind));

      return kinds.size === 1 ? ([...kinds][0] ?? null) : null;
    }

    default:
      return null;
  }
};

export const keyName = (key: PropertyKey) => {
  if (key.type === 'Identifier') return key.name;

  return key.type === 'Literal' && typeof key.value === 'string' ? key.value : null;
};

/** A zod object's fields; null when a spread or a computed key hides some. */
export const objectFields = (object: ObjectExpression) => {
  const fields: Fields = new Map();

  for (const property of object.properties) {
    if (property.type !== 'Property' || property.computed) return null;

    const name = keyName(property.key);

    if (!name) return null;

    fields.set(name, zodField(property.value));
  }

  return fields;
};

/**
 * An object type's fields; null when it has methods, index signatures or function-typed fields,
 * which no schema or table holds.
 */
export const typeFields = (members: TSSignature[]) => {
  const fields: Fields = new Map();

  for (const member of members) {
    if (member.type !== 'TSPropertySignature' || member.computed) return null;

    const name = keyName(member.key);
    const type = member.typeAnnotation?.typeAnnotation;

    if (!name || type?.type === 'TSFunctionType') return null;

    fields.set(name, {
      kind: type ? typeKind(type) : null,
      optional: member.optional || unionHas(type, 'TSUndefinedKeyword'),
      nullable: unionHas(type, 'TSNullKeyword'),
    });
  }

  return fields;
};
