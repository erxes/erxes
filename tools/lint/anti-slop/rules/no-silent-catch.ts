import { defineRule } from 'vite-plus/lint/plugins';

import { arrayMethodTarget } from '../shared/array-method.ts';

import type { ESTree, SourceCode } from 'vite-plus/lint/plugins';

/** `null`, `undefined`, `void 0`, `[]` and `{}`: a value that hides the failure. */
function isDefaultValue(node: ESTree.Node | null): boolean {
  if (node === null) return true;

  if (node.type === 'ParenthesizedExpression') return isDefaultValue(node.expression);

  if (node.type === 'Literal') return node.raw === 'null';

  if (node.type === 'Identifier') return node.name === 'undefined';

  if (node.type === 'UnaryExpression') return node.operator === 'void';

  if (node.type === 'ArrayExpression') return node.elements.length === 0;

  return node.type === 'ObjectExpression' && node.properties.length === 0;
}

/** A function passed as the handler of `promise.catch(handler)`. */
function isCatchCallback(node: ESTree.Node): boolean {
  const call = node.parent;

  return (
    call?.type === 'CallExpression' &&
    call.arguments[0] === node &&
    call.callee.type !== 'Super' &&
    call.callee.type !== 'V8IntrinsicExpression' &&
    arrayMethodTarget(call.callee)?.name === 'catch'
  );
}

/** The catch clause or `.catch` callback a `return` belongs to, if any. */
function enclosingHandler(node: ESTree.Node): ESTree.Node | null {
  let child = node;
  let parent = node.parent;

  while (parent !== null) {
    if (parent.type === 'CatchClause' && parent.body === child) return parent;

    if (
      parent.type === 'FunctionDeclaration' ||
      parent.type === 'FunctionExpression' ||
      parent.type === 'ArrowFunctionExpression'
    ) {
      return isCatchCallback(parent) ? parent : null;
    }

    child = parent;
    parent = parent.parent;
  }

  return null;
}

function contains(outer: ESTree.Node, inner: ESTree.Node): boolean {
  return outer.range[0] <= inner.range[0] && inner.range[1] <= outer.range[1];
}

/**
 * A `return` of a default is handled when an enclosing branch tests the error
 * (`if (isNotFound(error)) return null`), or when an earlier statement in an
 * enclosing block uses the error or throws (logging, rethrowing).
 */
function isHandled(sourceCode: SourceCode, handler: ESTree.Node, node: ESTree.Node): boolean {
  const uses = sourceCode
    .getDeclaredVariables(handler)
    .flatMap((variable) => variable.references.map((reference) => reference.identifier));

  const usesError = (scope: ESTree.Node) => uses.some((use) => contains(scope, use));
  let child = node;
  let parent = node.parent;

  while (parent !== null && child !== handler) {
    if (
      (parent.type === 'IfStatement' || parent.type === 'ConditionalExpression') &&
      parent.test !== child &&
      usesError(parent.test)
    ) {
      return true;
    }

    if (parent.type === 'SwitchStatement' && usesError(parent.discriminant)) return true;

    if (parent.type === 'BlockStatement' || parent.type === 'SwitchCase') {
      const statements = parent.type === 'BlockStatement' ? parent.body : parent.consequent;

      const before = statements.slice(
        0,
        statements.findIndex((statement) => statement === child),
      );

      if (before.some((statement) => usesError(statement) || statement.type === 'ThrowStatement')) {
        return true;
      }
    }

    child = parent;
    parent = parent.parent;
  }

  return false;
}

/** Ban error handlers that turn a failure into an empty default without looking at it. */
export const noSilentCatchRule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow catch handlers that return null, undefined, [] or {} before logging, rethrowing or narrowing the error.',
    },
    messages: {
      silentCatch:
        'This handler turns every failure into an empty default. Log the error, rethrow it, or narrow it first (`if (isNotFound(error)) return null`).',
    },
  },
  createOnce(context) {
    return {
      ReturnStatement(node) {
        if (!isDefaultValue(node.argument)) return;
        const handler = enclosingHandler(node);

        if (handler !== null && !isHandled(context.sourceCode, handler, node)) {
          context.report({ node, messageId: 'silentCatch' });
        }
      },
      ArrowFunctionExpression(node) {
        if (!isCatchCallback(node)) return;
        const body = node.body;

        const silent =
          body.type === 'BlockStatement' ? body.body.length === 0 : isDefaultValue(body);

        if (silent) context.report({ node: body, messageId: 'silentCatch' });
      },
    };
  },
});
