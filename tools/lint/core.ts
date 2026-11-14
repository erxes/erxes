// Rules tied to core's own layout: its value lists in packages/db/src/enums.ts and its
// procedures' ACCESS policies. What plugins share is in @erxes/lint (packages/lint).
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

/**
 * A procedure's permission is its policy in `ACCESS` (apps/api/src/http/policies.ts),
 * checked before the handler runs. A service checks only what depends on the record, in a
 * named helper.
 */
const noServicePermissionRule = defineRule({
  meta: {
    type: 'problem',
    docs: { description: 'Disallow requirePermission in services.' },
    messages: {
      permission:
        "Put the procedure's permission in ACCESS (needs('...')). A check that depends on the record is a named helper built on can().",
    },
  },
  createOnce(context) {
    return {
      CallExpression(node) {
        if (node.callee.type === 'Identifier' && node.callee.name === 'requirePermission')
          context.report({ node, messageId: 'permission' });
      },
    };
  },
});

const corePlugin = eslintCompatPlugin({
  meta: { name: 'core' },
  rules: {
    'no-inline-enum': noInlineEnumRule,
    'no-service-permission': noServicePermissionRule,
  },
});

export default corePlugin;
