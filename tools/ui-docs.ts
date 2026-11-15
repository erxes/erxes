// Finds what tools/ui-exports.ts writes for each erxes-ui export: the declaration behind the
// name in src/index.ts, its doc comment, and a hint of what it takes, read from the source.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import {
  type Declaration,
  type Expression,
  type ParamPattern,
  type ParseResult,
  parseSync,
  type Program,
  type TSSignature,
} from 'oxc-parser';

type Source = { file: string; text: string; parsed: ParseResult };

/** A parameter: its name, `...Props` for a props type, or the keys it destructures. */
type Param = string | string[];

/** What an export takes: a compound's parts, a function's parameters, a type's fields. */
export type Hint = { parts: string[] } | { params: Param[] } | { fields: string[] };

export type ExportDoc = { doc: string | undefined; hint: Hint | undefined };

const sources = new Map<string, Source>();

const load = (file: string) => {
  const cached = sources.get(file);

  if (cached) return cached;

  const text = readFileSync(file, 'utf8');
  const parsed = parseSync(file, text);
  const [error] = parsed.errors;

  if (error) throw new Error(`${file}: ${error.message}`);

  const source = { file, text, parsed };

  sources.set(file, source);

  return source;
};

/** The file an import names, as the bundler resolves it. */
export const resolveModule = (from: string, request: string) => {
  const base = join(dirname(from), request);
  const file = ['.ts', '.tsx', '/index.ts', '/index.tsx'].map((ext) => base + ext).find(existsSync);

  if (!file) throw new Error(`${from}: can't resolve ${request}`);

  return file;
};

/** The first sentence of the doc comment that ends right before `start`. */
const docBefore = ({ text, parsed }: Source, start: number) => {
  const comment = parsed.comments.findLast((candidate) => candidate.end <= start);

  if (comment?.type !== 'Block' || !comment.value.startsWith('*')) return undefined;

  if (text.slice(comment.end, start).trim() !== '') return undefined;

  const paragraph = comment.value
    .split('\n')
    .map((line) => line.replace(/^\s*\*+\s?/, '').trim())
    .join('\n')
    .trim()
    .split(/\n\s*\n/)[0];

  return paragraph
    ?.replaceAll(/\s+/g, ' ')
    .match(/^.*?(?<!\b(?:e\.g|i\.e|etc))[.!?](?=\s|$)|^.*$/)?.[0];
};

// Every component takes these, so naming them says nothing.
const commonProps = new Set(['className', 'children', 'ref']);

const paramOf = (param: ParamPattern): Param => {
  switch (param.type) {
    case 'Identifier': {
      const type = param.typeAnnotation?.typeAnnotation;

      return type?.type === 'TSTypeReference' &&
        !type.typeArguments &&
        type.typeName.type === 'Identifier' &&
        type.typeName.name.endsWith('Props')
        ? `...${type.typeName.name}`
        : param.name;
    }

    case 'ObjectPattern':
      return param.properties.flatMap((property) =>
        property.type === 'Property' &&
        property.key.type === 'Identifier' &&
        !commonProps.has(property.key.name)
          ? [property.key.name]
          : [],
      );
    case 'AssignmentPattern':
      return paramOf(param.left);
    case 'RestElement':
      return `...${String(paramOf(param.argument))}`;
    case 'ArrayPattern':
      return '[]';
    case 'TSParameterProperty':
      return '';
  }
};

const memberNames = (members: TSSignature[]) =>
  members.flatMap((member) =>
    (member.type === 'TSPropertySignature' || member.type === 'TSMethodSignature') &&
    member.key.type === 'Identifier'
      ? [member.key.name]
      : [],
  );

/** A value's hint: `Object.assign(Root, { Part })`'s parts, or a function's parameters. */
const expressionHint = (node: Expression | null | undefined): Hint | undefined => {
  switch (node?.type) {
    case 'TSAsExpression':
    case 'TSSatisfiesExpression':
      return expressionHint(node.expression);
    case 'ArrowFunctionExpression':
    case 'FunctionExpression':
      return { params: node.params.map(paramOf) };
    case 'CallExpression': {
      const [first, second] = node.arguments;

      const isAssign =
        node.callee.type === 'MemberExpression' &&
        node.callee.property.type === 'Identifier' &&
        node.callee.property.name === 'assign';

      if (isAssign && second?.type === 'ObjectExpression') {
        const parts = second.properties.flatMap((property) =>
          property.type === 'Property' && property.key.type === 'Identifier'
            ? [property.key.name]
            : [],
        );

        return { parts };
      }

      // forwardRef(fn), memo(fn), lazy(() => …): the function inside.
      return first?.type === 'SpreadElement' ? undefined : expressionHint(first);
    }

    default:
      return undefined;
  }
};

const declarationHint = (node: Declaration, name: string): Hint | undefined => {
  switch (node.type) {
    case 'VariableDeclaration':
      return expressionHint(
        node.declarations.find((item) => item.id.type === 'Identifier' && item.id.name === name)
          ?.init,
      );
    case 'FunctionDeclaration':
      return { params: node.params.map(paramOf) };
    case 'TSTypeAliasDeclaration':
      return node.typeAnnotation.type === 'TSTypeLiteral'
        ? { fields: memberNames(node.typeAnnotation.members) }
        : undefined;
    case 'TSInterfaceDeclaration':
      return { fields: memberNames(node.body.body) };
    default:
      return undefined;
  }
};

const declares = (node: Declaration, name: string) =>
  node.type === 'VariableDeclaration'
    ? node.declarations.some((item) => item.id.type === 'Identifier' && item.id.name === name)
    : 'id' in node && node.id?.type === 'Identifier' && node.id.name === name;

type Found = { declaration: Declaration; start: number } | { request: string; name: string };

const nameOf = (node: { type: string; name?: unknown }) =>
  node.type === 'Identifier' && typeof node.name === 'string' ? node.name : undefined;

/** The top-level declaration of the local `name`, or the module it is imported from. */
const findLocal = (program: Program, name: string): Found | undefined => {
  for (const statement of program.body) {
    if (statement.type === 'ImportDeclaration') {
      const specifier = statement.specifiers.find((item) => item.local.name === name);

      if (specifier?.type === 'ImportSpecifier')
        return { request: statement.source.value, name: nameOf(specifier.imported) ?? name };
    }

    const declaration =
      statement.type === 'ExportNamedDeclaration' ? statement.declaration : statement;

    if (
      declaration &&
      (declaration.type === 'VariableDeclaration' ||
        declaration.type === 'FunctionDeclaration' ||
        declaration.type === 'ClassDeclaration' ||
        declaration.type === 'TSTypeAliasDeclaration' ||
        declaration.type === 'TSInterfaceDeclaration' ||
        declaration.type === 'TSEnumDeclaration') &&
      declares(declaration, name)
    )
      return { declaration, start: statement.start };
  }

  return undefined;
};

/** What `program` exports as `name`: its declaration, or the module it re-exports it from. */
const findExport = (program: Program, name: string) => {
  for (const statement of program.body) {
    if (statement.type !== 'ExportNamedDeclaration') continue;

    const specifier = statement.specifiers.find((item) => nameOf(item.exported) === name);
    const local = specifier && nameOf(specifier.local);

    if (local && statement.source) return { request: statement.source.value, name: local };

    if (local) return findLocal(program, local);
  }

  return findLocal(program, name);
};

/** The doc and hint of `name`, as `file` exports it. */
export const describeExport = (file: string, name: string): ExportDoc => {
  const source = load(file);
  const found = findExport(source.parsed.program, name);

  if (!found) throw new Error(`${file}: no declaration of ${name}`);

  if ('request' in found) return describeExport(resolveModule(file, found.request), found.name);

  return {
    doc: docBefore(source, found.start),
    hint: declarationHint(found.declaration, name),
  };
};
