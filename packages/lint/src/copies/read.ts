// What one file defines (zod objects, tables, value lists) and what it writes by hand (interfaces,
// object types, parameter types, string unions), for check-copies to match across the repo.
import {
  type CallExpression,
  type Expression,
  type ParamPattern,
  parseSync,
  type TSAsExpression,
  type TSTypeAliasDeclaration,
  Visitor,
} from 'oxc-parser';
import {
  type Field,
  type Fields,
  columnField,
  keyName,
  objectFields,
  resolveRefs,
  typeFields,
  zodField,
} from './fields.ts';

export interface Place {
  file: string;
  line: number;
  name: string;
  /** Offset in the file, which names a source by the variable it is assigned to. */
  start: number;
}

/** A zod object, a table or a hand-written object type: its fields. */
export interface Definition extends Place {
  fields: Fields;
}

/** An `as const` list, a `z.enum([...])` or a hand-written string union. */
interface ValueList extends Place {
  values: Set<string>;
  zod: boolean;
}

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
    ? objectFields(first)
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
        ? [[name, columnField(property.value)] as const]
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

/** `const OptionalText = (max: number) => z.string().max(max).optional()` is a schema too. */
const schemaOf = (init: Expression) =>
  zodField(
    init.type === 'ArrowFunctionExpression' &&
      init.expression &&
      init.body.type !== 'BlockStatement'
      ? init.body
      : init,
  );

/** `z.enum(['a', 'b'])`'s values. */
const zodEnumValues = (node: CallExpression) => {
  const [first] = node.arguments;

  return isZodCall(node, /^enum$/) && first && first.type !== 'SpreadElement'
    ? stringList(first)
    : null;
};

/** `['a', 'b'] as const`'s values. */
const constValues = (node: TSAsExpression) => {
  const { typeAnnotation: type } = node;

  const isConst =
    type.type === 'TSTypeReference' &&
    type.typeName.type === 'Identifier' &&
    type.typeName.name === 'const';

  return isConst ? stringList(node.expression) : null;
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
  // Each `const Money = z.…`, for the zod objects that reuse it.
  const schemas = new Map<string, Field>();
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

      if (node.id.type !== 'Identifier' || !init) return;

      names.set(init.start, node.id.name);
      schemas.set(node.id.name, schemaOf(init));
    },
    CallExpression(node) {
      const zod = zodObjectFields(node);
      const columns = tableColumns(node);
      const list = zodEnumValues(node);

      if (isZodCall(node, /^lazy$/)) lazy.push([node.start, node.end]);

      if (zod) zodObjects.push({ ...at(node.start), fields: zod });

      if (columns) tables.push({ ...at(node.start), fields: columns });

      if (list) lists.push({ ...at(node.start), values: list, zod: true });
    },
    TSAsExpression(node) {
      const list = constValues(node);

      if (list) lists.push({ ...at(node.expression.start), values: list, zod: false });
    },
    // A generic type is written once for many shapes, so it repeats none of them.
    TSInterfaceDeclaration(node) {
      const fields =
        node.extends.length === 0 && !node.typeParameters ? typeFields(node.body.body) : null;

      if (fields) copies.push({ ...at(node.start, node.id.name), fields });
    },
    TSTypeAliasDeclaration(node) {
      const type = node.typeAnnotation;

      const fields =
        type.type === 'TSTypeLiteral' && !node.typeParameters ? typeFields(type.members) : null;

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

  // A schema this file defines wins over another file's of the same name.
  const local = (item: Definition) => ({
    ...item,
    fields: resolveRefs(item.fields, (ref) => schemas.get(ref)),
  });

  return {
    zodObjects: zodObjects
      .filter((item) => !inLazy(item))
      .map(local)
      .map(named),
    tables: tables.map(named),
    lists: lists.map(named),
    schemas,
    copies,
    unions,
  };
};
