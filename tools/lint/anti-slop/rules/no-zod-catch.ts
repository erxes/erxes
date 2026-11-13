import { type ESTree, defineRule } from 'vite-plus/lint/plugins';

/** The identifier a member chain like `z.string().optional()` starts from. */
const chainRoot = (input: ESTree.Node): ESTree.Node => {
  let node = input;

  while (node.type === 'CallExpression' || node.type === 'MemberExpression') {
    node = node.type === 'CallExpression' ? node.callee : node.object;
  }

  return node;
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
 * with a handler stays allowed.
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

        const root = chainRoot(callee.object);
        const onZod = root.type === 'Identifier' && root.name === 'z';

        if (onZod || isValue(node.arguments[0])) context.report({ node, messageId: 'zodCatch' });
      },
    };
  },
});
