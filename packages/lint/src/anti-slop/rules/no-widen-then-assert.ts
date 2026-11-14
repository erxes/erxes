import { defineRule } from 'vite-plus/lint/plugins';
import type { ESTree, Variable } from 'vite-plus/lint/plugins';
import {
  broadTypeKind,
  type BroadTypeKind,
  isDefinitelyNarrowerRecordType,
  isDefinitelyObjectType,
  typesHaveSameSyntax,
} from '../shared/broad-types.ts';

type KnownValueEvidence = {
  readonly type: ESTree.TSType | null;
};

const functionBoundaryTypes = new Set([
  'ArrowFunctionExpression',
  'FunctionDeclaration',
  'FunctionExpression',
  'TSDeclareFunction',
  'TSEmptyBodyFunctionExpression',
]);

function unwrapExpressionParentheses(expression: ESTree.Expression): ESTree.Expression {
  let current = expression;

  while (current.type === 'ParenthesizedExpression') current = current.expression;

  return current;
}

function assertedExpression(
  node: ESTree.TSAsExpression | ESTree.TSTypeAssertion,
): ESTree.Expression {
  return unwrapExpressionParentheses(node.expression);
}

function assertionFromExpression(
  expression: ESTree.Expression,
): ESTree.TSAsExpression | ESTree.TSTypeAssertion | null {
  const unwrapped = unwrapExpressionParentheses(expression);

  return unwrapped.type === 'TSAsExpression' || unwrapped.type === 'TSTypeAssertion'
    ? unwrapped
    : null;
}

function functionBoundary(node: ESTree.Node): ESTree.Node | null {
  let current = node.parent;

  while (current !== null && current.type !== 'Program') {
    if (functionBoundaryTypes.has(current.type)) return current;
    current = current.parent;
  }

  return null;
}

function resolvedVariableForIdentifier(
  scopes: readonly {
    readonly references: readonly {
      readonly identifier: ESTree.Node;
      readonly resolved: Variable | null;
    }[];
  }[],
  identifier: ESTree.IdentifierReference,
): Variable | null {
  for (const scope of scopes) {
    const reference = scope.references.find(
      (candidate) =>
        candidate.identifier.start === identifier.start &&
        candidate.identifier.end === identifier.end,
    );

    if (reference !== undefined) return reference.resolved;
  }

  return null;
}

function variableDeclarator(variable: Variable): ESTree.VariableDeclarator | null {
  for (const definition of variable.defs) {
    if (definition.type === 'Variable' && definition.node.type === 'VariableDeclarator') {
      return definition.node;
    }
  }

  return null;
}

function knownValueEvidence(
  expression: ESTree.Expression,
  scopes: Parameters<typeof resolvedVariableForIdentifier>[0],
  boundary: ESTree.Node | null,
  visitedVariables: ReadonlySet<Variable>,
): KnownValueEvidence | null {
  const unwrapped = unwrapExpressionParentheses(expression);

  if (unwrapped.type === 'TSAsExpression' || unwrapped.type === 'TSTypeAssertion') {
    if (broadTypeKind(unwrapped.typeAnnotation) !== null) return null;

    return { type: unwrapped.typeAnnotation };
  }

  if (unwrapped.type === 'Literal' || unwrapped.type === 'TemplateLiteral') {
    return { type: null };
  }

  if (
    unwrapped.type === 'ArrayExpression' ||
    unwrapped.type === 'ArrowFunctionExpression' ||
    unwrapped.type === 'ClassExpression' ||
    unwrapped.type === 'FunctionExpression' ||
    unwrapped.type === 'NewExpression' ||
    unwrapped.type === 'ObjectExpression'
  ) {
    return { type: null };
  }

  if (unwrapped.type !== 'Identifier') return null;
  const variable = resolvedVariableForIdentifier(scopes, unwrapped);

  if (variable === null || visitedVariables.has(variable)) return null;

  const annotatedIdentifier = variable.identifiers.find(
    (identifier) => identifier.typeAnnotation !== null && identifier.typeAnnotation !== undefined,
  );

  const annotation = annotatedIdentifier?.typeAnnotation?.typeAnnotation;

  if (annotation !== undefined && annotatedIdentifier !== undefined) {
    if (functionBoundary(annotatedIdentifier) !== boundary || broadTypeKind(annotation) !== null) {
      return null;
    }

    return { type: annotation };
  }

  const declarator = variableDeclarator(variable);

  if (
    declarator === null ||
    declarator.parent.type !== 'VariableDeclaration' ||
    declarator.parent.kind !== 'const' ||
    declarator.init === null ||
    variable.references.some((reference) => reference.isWrite() && !reference.init) ||
    functionBoundary(declarator) !== boundary
  ) {
    return null;
  }

  return knownValueEvidence(
    declarator.init,
    scopes,
    boundary,
    new Set([...visitedVariables, variable]),
  );
}

function widenedBinding(
  variable: Variable,
  scopes: Parameters<typeof resolvedVariableForIdentifier>[0],
): {
  readonly broadKind: BroadTypeKind;
  readonly evidence: KnownValueEvidence;
  readonly declaredAt: number;
  readonly boundary: ESTree.Node | null;
} | null {
  const declarator = variableDeclarator(variable);

  if (
    declarator === null ||
    declarator.parent.type !== 'VariableDeclaration' ||
    declarator.parent.kind !== 'const' ||
    declarator.id.type !== 'Identifier' ||
    declarator.init === null ||
    variable.references.some((reference) => reference.isWrite() && !reference.init)
  ) {
    return null;
  }

  const boundary = functionBoundary(declarator);
  const declaredType = declarator.id.typeAnnotation?.typeAnnotation;
  const initializerAssertion = assertionFromExpression(declarator.init);

  const initializerBroadKind =
    initializerAssertion === null ? null : broadTypeKind(initializerAssertion.typeAnnotation);

  const declaredBroadKind = declaredType === undefined ? null : broadTypeKind(declaredType);
  const broadKind = declaredBroadKind ?? initializerBroadKind;

  if (broadKind === null) return null;

  const originalExpression =
    initializerAssertion !== null && initializerBroadKind !== null
      ? assertedExpression(initializerAssertion)
      : declarator.init;

  const evidence = knownValueEvidence(originalExpression, scopes, boundary, new Set([variable]));

  return evidence === null ? null : { broadKind, evidence, declaredAt: declarator.end, boundary };
}

function assertionIsNarrower(
  sourceText: string,
  broadKind: BroadTypeKind,
  evidence: KnownValueEvidence,
  assertedType: ESTree.TSType,
): boolean {
  if (broadTypeKind(assertedType) !== null) return false;

  if (broadKind === 'top') return true;

  if (typesHaveSameSyntax(sourceText, evidence.type, assertedType)) return true;

  if (broadKind === 'object') return isDefinitelyObjectType(assertedType);

  return isDefinitelyNarrowerRecordType(assertedType);
}

/** Detect immutable local bindings that erase a known type and are later asserted back to a narrower type. */
export const noWidenThenAssertRule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow local const flows that explicitly widen a known value before asserting the widened binding to a narrower type.',
    },
    messages: {
      widenThenAssert:
        'Binding "{{name}}" discards type evidence and later recreates it with an assertion. Keep the precise type from initialization through use; parse boundary input once.',
    },
  },
  createOnce(context) {
    let scopes: Parameters<typeof resolvedVariableForIdentifier>[0] = [];

    const checkAssertion = (node: ESTree.TSAsExpression | ESTree.TSTypeAssertion) => {
      const expression = assertedExpression(node);

      if (expression.type !== 'Identifier') return;

      const variable = resolvedVariableForIdentifier(scopes, expression);

      if (variable === null) return;
      const widened = widenedBinding(variable, scopes);

      if (
        widened === null ||
        node.start <= widened.declaredAt ||
        functionBoundary(node) !== widened.boundary ||
        !assertionIsNarrower(
          context.sourceCode.text,
          widened.broadKind,
          widened.evidence,
          node.typeAnnotation,
        )
      ) {
        return;
      }

      context.report({
        node,
        messageId: 'widenThenAssert',
        data: { name: expression.name },
      });
    };

    return {
      Program() {
        scopes = context.sourceCode.scopeManager.scopes;
      },
      TSAsExpression: checkAssertion,
      TSTypeAssertion: checkAssertion,
    };
  },
});
