import { defineRule, eslintCompatPlugin, type ESTree } from 'vite-plus/lint/plugins';

/** `[...] as const` and `[...] satisfies T` are still the array. */
const unwrap = (node: ESTree.Node): ESTree.Node =>
  node.type === 'TSAsExpression' || node.type === 'TSSatisfiesExpression'
    ? unwrap(node.expression)
    : node;

const isLiteralList = (node: ESTree.Node | null) => {
  const list = node && unwrap(node);

  return (
    list?.type === 'ArrayExpression' &&
    list.elements.some(
      (element) =>
        element?.type === 'Literal' &&
        (typeof element.value === 'string' || typeof element.value === 'number'),
    )
  );
};

/** `enum`, `'enum'` or `['enum']`. */
const isEnumKey = (key: ESTree.Node) =>
  (key.type === 'Identifier' && key.name === 'enum') ||
  (key.type === 'Literal' && key.value === 'enum');

/** Quoted strings and comments are blanked, so only SQL itself is read. */
const NOT_SQL = /'(?:[^']|'')*'|--[^\n]*|\/\*[\s\S]*?\*\//g;

/** `IN ('a', 'b')` or `IN (0, 1)` written out in SQL. */
const SQL_LIST = /\bIN\s*\(\s*(?:E?''|-?\d)/i;

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
          (callee.type === 'MemberExpression' && isEnumKey(callee.property)) ||
          (callee.type === 'Identifier' && callee.name === 'pgEnum');

        if (isEnum && node.arguments.some(isLiteralList)) {
          context.report({ node, messageId: 'list' });
        }
      },
      Property(node) {
        if (isEnumKey(node.key) && isLiteralList(node.value)) {
          context.report({ node, messageId: 'list' });
        }
      },
      TaggedTemplateExpression(node) {
        if (node.tag.type !== 'Identifier' || node.tag.name !== 'sql') return;

        // Joined with a placeholder, so a string or comment cut by `${…}` is still blanked whole.
        const text = node.quasi.quasis.map((quasi) => quasi.value.raw).join('?');

        if (SQL_LIST.test(text.replace(NOT_SQL, "''"))) {
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
