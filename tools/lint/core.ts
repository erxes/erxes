// Rules tied to core's own layout: its value lists in packages/db/src/enums.ts, its
// procedures' ACCESS policies and its addresses in apps/web/src/lib/paths.ts. What plugins share is in @erxes/lint (packages/lint).
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

/** Where a link's address goes: `<Link to>`, `<Navigate to>`, breadcrumb items, `navigate()`. */
const LINK_KEYS = new Set(['to', 'pathname']);

const isStringValue = (node: ESTree.Node | null | undefined): boolean => {
  const value =
    node?.type === 'JSXExpressionContainer' && node.expression.type !== 'JSXEmptyExpression'
      ? node.expression
      : node;

  if (value?.type === 'ConditionalExpression') {
    return isStringValue(value.consequent) || isStringValue(value.alternate);
  }

  if (value?.type === 'LogicalExpression') return isStringValue(value.right);

  return (
    value?.type === 'TemplateLiteral' ||
    (value?.type === 'Literal' && typeof value.value === 'string')
  );
};

/** An address written out: `'/settings'`, or a template with a `/` (`${base}/${id}`). */
const isAddress = (node: ESTree.Node) =>
  (node.type === 'Literal' && typeof node.value === 'string' && node.value.startsWith('/')) ||
  (node.type === 'TemplateLiteral' && node.quasis.some((quasi) => quasi.value.raw.includes('/')));

const keyName = (key: ESTree.Node) =>
  key.type === 'Identifier' || key.type === 'JSXIdentifier'
    ? key.name
    : key.type === 'Literal'
      ? key.value
      : undefined;

const noStringLinkRule = defineRule({
  meta: {
    type: 'suggestion',
    docs: { description: 'Disallow hand-written addresses in links and navigation.' },
    messages: {
      link: 'Take the address from `paths` (apps/web/src/lib/paths.ts): paths.contacts.customers, paths.contacts.customer(id).',
    },
  },
  createOnce(context) {
    return {
      JSXAttribute(node) {
        const name = keyName(node.name);

        // `to`, and props that pass one on (`viewAllTo`).
        if (typeof name === 'string' && /^to$|To$/.test(name) && isStringValue(node.value)) {
          context.report({ node, messageId: 'link' });
        }
      },
      Property(node) {
        const name = keyName(node.key);

        // `to` is also an email's recipient or a range's end: only addresses count there.
        if (typeof name === 'string' && LINK_KEYS.has(name) && isAddress(node.value)) {
          context.report({ node, messageId: 'link' });
        }
      },
      CallExpression(node) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'navigate' &&
          isStringValue(node.arguments[0])
        ) {
          context.report({ node, messageId: 'link' });
        }
      },
    };
  },
});

const corePlugin = eslintCompatPlugin({
  meta: { name: 'core' },
  rules: {
    'no-inline-enum': noInlineEnumRule,
    'no-service-permission': noServicePermissionRule,
    'no-string-link': noStringLinkRule,
  },
});

export default corePlugin;
