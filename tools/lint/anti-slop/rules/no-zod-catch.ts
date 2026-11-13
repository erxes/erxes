import { type ESTree, type Scope, type SourceCode, defineRule } from 'vite-plus/lint/plugins';

import { unwrapArrayExpression } from '../shared/array-method.ts';

/** The identifier a member chain like `z.string().optional()` starts from. */
const chainRoot = (input: ESTree.Node) => {
  let node = unwrapArrayExpression(input);

  while (node.type === 'CallExpression' || node.type === 'MemberExpression') {
    node = unwrapArrayExpression(node.type === 'CallExpression' ? node.callee : node.object);
  }

  return node;
};

/** Built from zod's import: `z.string()`, or a const that is (`const Tier = z.enum(...)`). */
const isZodSchema = (sourceCode: SourceCode, input: ESTree.Node, depth = 0): boolean => {
  const root = chainRoot(input);

  if (root.type !== 'Identifier' || depth > 10) return false;

  let scope: Scope | null = sourceCode.getScope(root);

  while (scope && !scope.set.has(root.name)) scope = scope.upper;

  const definition = scope?.set.get(root.name)?.defs[0];

  if (definition?.type === 'ImportBinding')
    return (
      definition.parent?.type === 'ImportDeclaration' &&
      /^zod(\/|$)/.test(definition.parent.source.value)
    );

  if (definition?.node.type === 'VariableDeclarator' && definition.node.init)
    return isZodSchema(sourceCode, definition.node.init, depth + 1);

  return false;
};

/** A fallback value, as zod's `.catch(value)` takes; a Promise's `.catch` takes a handler. */
const isValue = (node: ESTree.Node | undefined) =>
  node?.type === 'Literal' ||
  node?.type === 'ArrayExpression' ||
  node?.type === 'ObjectExpression' ||
  node?.type === 'TemplateLiteral' ||
  node?.type === 'UnaryExpression' ||
  (node?.type === 'Identifier' && node.name === 'undefined');

/**
 * Ban zod's `.catch()`: it swaps a malformed value for a fallback without a
 * trace, so a bad token claim can turn into the top tier. Promise `.catch`
 * with a handler stays allowed. A schema imported from another file is caught
 * only when the fallback is a plain value.
 */
export const noZodCatchRule = defineRule({
  meta: {
    type: 'problem',
    docs: { description: "Disallow zod's .catch(); fail on malformed input instead." },
    messages: {
      zodCatch:
        'Zod `.catch()` hides malformed input behind a fallback. Use `.default()` for a missing value, or `safeParse` and handle the failure where you call it.',
    },
  },
  createOnce(context) {
    return {
      CallExpression(node) {
        const callee = node.callee;

        if (callee.type !== 'MemberExpression' || callee.computed) return;

        if (callee.property.type !== 'Identifier' || callee.property.name !== 'catch') return;

        if (isValue(node.arguments[0]) || isZodSchema(context.sourceCode, callee.object))
          context.report({ node, messageId: 'zodCatch' });
      },
    };
  },
});
