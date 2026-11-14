import type { ESTree, Scope, SourceCode, Variable } from 'vite-plus/lint/plugins';

/** Unwrap syntax-only wrappers when inspecting array methods and accumulator references. */
export function unwrapArrayExpression(node: ESTree.Node): ESTree.Node {
  let current = node;

  while (
    current.type === 'ParenthesizedExpression' ||
    current.type === 'ChainExpression' ||
    current.type === 'TSAsExpression' ||
    current.type === 'TSTypeAssertion' ||
    current.type === 'TSNonNullExpression' ||
    current.type === 'TSSatisfiesExpression'
  ) {
    current = current.expression;
  }

  return current;
}

/** Resolve a local binding by scope, not by identifier spelling. */
export function resolveArrayBinding(sourceCode: SourceCode, input: ESTree.Node): Variable | null {
  const node = unwrapArrayExpression(input);

  if (node.type !== 'Identifier') return null;
  let scope: Scope | null = sourceCode.getScope(node);

  while (scope !== null) {
    const variable = scope.set.get(node.name);

    if (variable !== undefined) return variable;
    scope = scope.upper;
  }

  return null;
}

/** Read static method names, including computed string literals, without evaluating expressions. */
export function arrayMethodTarget(
  input: ESTree.Node,
): { readonly name: string; readonly object: ESTree.Node } | null {
  const node = unwrapArrayExpression(input);

  if (node.type !== 'MemberExpression') return null;
  const property = node.property;

  if (!node.computed && property.type === 'Identifier') {
    return { name: property.name, object: node.object };
  }

  if (node.computed && property.type === 'Literal' && typeof property.value === 'string') {
    return { name: property.value, object: node.object };
  }

  return null;
}

function isArrayAnnotation(type: ESTree.TSType): boolean {
  if (type.type === 'TSArrayType' || type.type === 'TSTupleType') return true;

  if (type.type === 'TSParenthesizedType') return isArrayAnnotation(type.typeAnnotation);

  if (type.type === 'TSTypeOperator' && type.operator === 'readonly') {
    return isArrayAnnotation(type.typeAnnotation);
  }

  return (
    type.type === 'TSTypeReference' &&
    type.typeName.type === 'Identifier' &&
    (type.typeName.name === 'Array' || type.typeName.name === 'ReadonlyArray')
  );
}

/** Recognize local array evidence; unknown receivers and iterator pipelines are deliberately excluded. */
export function isKnownArrayExpression(
  sourceCode: SourceCode,
  input: ESTree.Node,
  visited = new Set<Variable>(),
): boolean {
  const node = unwrapArrayExpression(input);

  if (node.type === 'ArrayExpression') return true;

  if (node.type === 'CallExpression') {
    const method = arrayMethodTarget(node.callee);

    return (
      method !== null &&
      [
        'map',
        'filter',
        'flatMap',
        'slice',
        'concat',
        'toSorted',
        'toReversed',
        'toSpliced',
      ].includes(method.name) &&
      isKnownArrayExpression(sourceCode, method.object, visited)
    );
  }

  if (node.type !== 'Identifier') return false;
  const variable = resolveArrayBinding(sourceCode, node);

  if (variable === null || visited.has(variable)) return false;
  visited.add(variable);

  if (variable.references.some((reference) => reference.isWrite() && !reference.init)) return false;

  for (const identifier of variable.identifiers) {
    const annotation = identifier.typeAnnotation?.typeAnnotation;

    if (annotation !== undefined) return isArrayAnnotation(annotation);
  }

  for (const definition of variable.defs) {
    if (
      definition.type === 'Variable' &&
      definition.node.type === 'VariableDeclarator' &&
      definition.node.id.type === 'Identifier' &&
      definition.node.init !== null &&
      definition.node.parent.type === 'VariableDeclaration' &&
      definition.node.parent.kind === 'const'
    ) {
      return isKnownArrayExpression(sourceCode, definition.node.init, visited);
    }
  }

  return false;
}
