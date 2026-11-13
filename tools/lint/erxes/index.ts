import { defineRule, eslintCompatPlugin, type ESTree } from 'vite-plus/lint/plugins';

const isLiteralList = (node: ESTree.Node | null) =>
  node?.type === 'ArrayExpression' &&
  node.elements.some(
    (element) =>
      element?.type === 'Literal' &&
      (typeof element.value === 'string' || typeof element.value === 'number'),
  );

/** `IN ('a', 'b')` or `IN (0, 1)` written out in SQL. */
const SQL_LIST = /\bIN\s*\(\s*(?:'|-?\d)/i;

/**
 * Value lists live once, in packages/db/src/enums.ts: `z.enum([...])`, `pgEnum(name, [...])`,
 * a column's `{ enum: [...] }` or a CHECK's `IN ('a', 'b')` spelled out anywhere else is a copy
 * that drifts.
 */
const noInlineEnumRule = defineRule({
  meta: {
    type: 'problem',
    docs: { description: 'Disallow value lists written out outside packages/db/src/enums.ts.' },
    messages: {
      list: 'Add this list to packages/db/src/enums.ts and use it from there (z.enum(LIST), text({ enum: LIST })).',
      check: 'Build the list from packages/db/src/enums.ts with inList(column, LIST).',
    },
  },
  createOnce(context) {
    return {
      CallExpression(node) {
        const { callee } = node;

        const isEnum =
          (callee.type === 'MemberExpression' &&
            callee.property.type === 'Identifier' &&
            callee.property.name === 'enum') ||
          (callee.type === 'Identifier' && callee.name === 'pgEnum');

        if (isEnum && node.arguments.some(isLiteralList)) {
          context.report({ node, messageId: 'list' });
        }
      },
      Property(node) {
        if (
          node.key.type === 'Identifier' &&
          node.key.name === 'enum' &&
          isLiteralList(node.value)
        ) {
          context.report({ node, messageId: 'list' });
        }
      },
      TaggedTemplateExpression(node) {
        if (node.tag.type !== 'Identifier' || node.tag.name !== 'sql') return;

        if (node.quasi.quasis.some((quasi) => SQL_LIST.test(quasi.value.raw))) {
          context.report({ node, messageId: 'check' });
        }
      },
    };
  },
});

/** Rules for erxes core's own conventions. */
const erxesPlugin = eslintCompatPlugin({
  meta: { name: 'erxes' },
  rules: { 'no-inline-enum': noInlineEnumRule },
});

export default erxesPlugin;
