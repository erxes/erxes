// What one file defines (zod objects, tables, value lists) and what it writes by hand (interfaces,
// object types, parameter types, string unions), for check-copies to match across the repo.
import {
  type CallExpression,
  type Expression,
  type ObjectExpression,
  type ParamPattern,
  parseSync,
  type PropertyKey,
  type TSSignature,
  type TSType,
  type TSTypeAliasDeclaration,
  Visitor,
} from 'oxc-parser';

/** What a field holds, as far as its source tells; null when it can't. */
export type Kind = 'string' | 'number' | 'boolean' | null;

export interface Place {
  file: string;
  line: number;
  name: string;
  /** Offset in the file, which names a source by the variable it is assigned to. */
  start: number;
}

/** A zod object, a table or a hand-written object type: its fields and what they hold. */
export interface Definition extends Place {
  fields: Map<string, Kind>;
}

/** An `as const` list, a `z.enum([...])` or a hand-written string union. */
interface ValueList extends Place {
  values: Set<string>;
  zod: boolean;
}

const ZOD_KINDS: Record<string, Kind> = {
  string: 'string',
  email: 'string',
  url: 'string',
  uuid: 'string',
  enum: 'string',
  number: 'number',
  int: 'number',
  boolean: 'boolean',
};

const COLUMN_KINDS: Record<string, Kind> = {
  text: 'string',
  varchar: 'string',
  char: 'string',
  uuid: 'string',
  integer: 'number',
  smallint: 'number',
  real: 'number',
  doublePrecision: 'number',
  boolean: 'boolean',
};

/** The first call of a chain: `z.string().min(1).nullable()` is `z.string`, `text('x').notNull()` is `text`. */
const chainRoot = (node: Expression) => {
  let current = node;

  while (current.type === 'CallExpression') {
    const { callee } = current;

    if (callee.type === 'Identifier') return { owner: null, name: callee.name };

    if (callee.type !== 'MemberExpression' || callee.property.type !== 'Identifier') return null;

    if (callee.object.type === 'Identifier') {
      return { owner: callee.object.name, name: callee.property.name };
    }

    current = callee.object;
  }

  return null;
};

const zodKind = (node: Expression): Kind => {
  const root = chainRoot(node);

  return root?.owner === 'z' ? (ZOD_KINDS[root.name] ?? null) : null;
};

const columnKind = (node: Expression): Kind => {
  const root = chainRoot(node);

  return root && !root.owner ? (COLUMN_KINDS[root.name] ?? null) : null;
};

const literalKind = (value: unknown): Kind => {
  if (typeof value === 'string') return 'string';

  if (typeof value === 'number') return 'number';

  return typeof value === 'boolean' ? 'boolean' : null;
};

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
      const kinds = new Set(
        type.types
          .filter((part) => part.type !== 'TSNullKeyword' && part.type !== 'TSUndefinedKeyword')
          .map(typeKind),
      );

      return kinds.size === 1 ? ([...kinds][0] ?? null) : null;
    }

    default:
      return null;
  }
};

const keyName = (key: PropertyKey) => {
  if (key.type === 'Identifier') return key.name;

  return key.type === 'Literal' && typeof key.value === 'string' ? key.value : null;
};

/** An object literal's keys and kinds; null when a spread or a computed key hides some. */
const objectFields = (object: ObjectExpression, kindOf: (value: Expression) => Kind) => {
  const fields = new Map<string, Kind>();

  for (const property of object.properties) {
    if (property.type !== 'Property' || property.computed) return null;

    const name = keyName(property.key);

    if (!name) return null;

    fields.set(name, kindOf(property.value));
  }

  return fields;
};

/** An object type's fields; null when it has methods or index signatures. */
const typeFields = (members: TSSignature[]) => {
  const fields = new Map<string, Kind>();

  for (const member of members) {
    if (member.type !== 'TSPropertySignature' || member.computed) return null;

    const name = keyName(member.key);

    if (!name) return null;

    fields.set(name, member.typeAnnotation ? typeKind(member.typeAnnotation.typeAnnotation) : null);
  }

  return fields;
};

/** The strings of `['a', 'b']`, or null when it holds anything else. */
const stringList = (node: Expression) => {
  if (node.type !== 'ArrayExpression' || node.elements.length < 2) return null;

  const values = node.elements.flatMap((element) =>
    element?.type === 'Literal' && typeof element.value === 'string' ? [element.value] : [],
  );

  return values.length === node.elements.length ? new Set(values) : null;
};

const isZodCall = (node: CallExpression, names: RegExp) =>
  node.callee.type === 'MemberExpression' &&
  node.callee.property.type === 'Identifier' &&
  node.callee.object.type === 'Identifier' &&
  node.callee.object.name === 'z' &&
  names.test(node.callee.property.name);

const isTableCall = (node: CallExpression) =>
  node.callee.type === 'Identifier' &&
  (node.callee.name === 'table' || node.callee.name.endsWith('Table'));

/** `z.object({...})`'s fields. */
const zodObjectFields = (node: CallExpression) => {
  const [first] = node.arguments;

  return isZodCall(node, /^(object|strictObject|looseObject)$/) &&
    first?.type === 'ObjectExpression'
    ? objectFields(first, zodKind)
    : null;
};

/** `table('name', {...})`'s columns; a spread of shared columns leaves the rest known. */
const tableColumns = (node: CallExpression) => {
  const [, columns] = node.arguments;

  if (!isTableCall(node) || columns?.type !== 'ObjectExpression') return null;

  return new Map(
    columns.properties.flatMap((property) => {
      const name = property.type === 'Property' ? keyName(property.key) : null;

      return property.type === 'Property' && name
        ? [[name, columnKind(property.value)] as const]
        : [];
    }),
  );
};

/** A string union's values, when every member is a string literal. */
const unionValues = (alias: TSTypeAliasDeclaration) => {
  const type = alias.typeAnnotation;

  if (type.type !== 'TSUnionType' || type.types.length < 2) return null;

  const values = type.types.flatMap((part) =>
    part.type === 'TSLiteralType' &&
    'value' in part.literal &&
    typeof part.literal.value === 'string'
      ? [part.literal.value]
      : [],
  );

  return values.length === type.types.length ? new Set(values) : null;
};

/** Everything one file defines and writes by hand. */
export const readFile = (file: string, text: string) => {
  const lineStarts = [0, ...[...text.matchAll(/\n/g)].map((match) => match.index + 1)];
  const lineOf = (offset: number) => lineStarts.findLastIndex((start) => start <= offset) + 1;

  const zodObjects: Definition[] = [];
  const tables: Definition[] = [];
  const lists: ValueList[] = [];
  const copies: Definition[] = [];
  const unions: ValueList[] = [];
  const names = new Map<number, string>();
  const lazy: number[][] = [];
  const at = (start: number, name = '') => ({ file, line: lineOf(start), name, start });

  const params = (patterns: ParamPattern[]) => {
    for (const param of patterns) {
      const type = 'typeAnnotation' in param ? param.typeAnnotation?.typeAnnotation : undefined;
      const fields = type?.type === 'TSTypeLiteral' ? typeFields(type.members) : null;

      if (fields) copies.push({ ...at(param.start, 'a parameter type'), fields });
    }
  };

  new Visitor({
    VariableDeclarator(node) {
      const init = node.init?.type === 'TSAsExpression' ? node.init.expression : node.init;

      if (node.id.type === 'Identifier' && init) names.set(init.start, node.id.name);
    },
    CallExpression(node) {
      const [first] = node.arguments;
      const zod = zodObjectFields(node);
      const columns = tableColumns(node);

      const list =
        isZodCall(node, /^enum$/) && first && first.type !== 'SpreadElement'
          ? stringList(first)
          : null;

      if (isZodCall(node, /^lazy$/)) lazy.push([node.start, node.end]);

      if (zod) zodObjects.push({ ...at(node.start), fields: zod });

      if (columns) tables.push({ ...at(node.start), fields: columns });

      if (list) lists.push({ ...at(node.start), values: list, zod: true });
    },
    TSAsExpression(node) {
      const { typeAnnotation: type } = node;

      const isConst =
        type.type === 'TSTypeReference' &&
        type.typeName.type === 'Identifier' &&
        type.typeName.name === 'const';

      const list = isConst ? stringList(node.expression) : null;

      if (list) lists.push({ ...at(node.expression.start), values: list, zod: false });
    },
    TSInterfaceDeclaration(node) {
      const fields = node.extends.length === 0 ? typeFields(node.body.body) : null;

      if (fields) copies.push({ ...at(node.start, node.id.name), fields });
    },
    TSTypeAliasDeclaration(node) {
      const type = node.typeAnnotation;
      const fields = type.type === 'TSTypeLiteral' ? typeFields(type.members) : null;
      const values = unionValues(node);

      if (fields) copies.push({ ...at(node.start, node.id.name), fields });

      if (values) unions.push({ ...at(node.start, node.id.name), values, zod: false });
    },
    ArrowFunctionExpression: (node) => params(node.params),
    FunctionDeclaration: (node) => params(node.params),
    FunctionExpression: (node) => params(node.params),
  }).visit(parseSync(file, text).program);

  // A recursive schema needs its type written out (z.lazy), so it is no source to infer from.
  const inLazy = ({ start }: { start: number }) =>
    lazy.some(([from = 0, to = 0]) => from <= start && start <= to);

  // A source's name is its variable's, known once the whole file is read.
  const named = <T extends Place>(item: T) => ({
    ...item,
    name: names.get(item.start) ?? `the one at ${item.file}:${item.line}`,
  });

  return {
    zodObjects: zodObjects.filter((item) => !inLazy(item)).map(named),
    tables: tables.map(named),
    lists: lists.map(named),
    copies,
    unions,
  };
};
