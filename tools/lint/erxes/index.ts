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

const SESSION_LOCK = /\bpg_(try_)?advisory_lock(_shared)?\s*\(/i;

/**
 * Core runs behind connection poolers, so a session-level advisory lock stays
 * on the pooled connection after the transaction that took it ends.
 */
const noSessionAdvisoryLockRule = defineRule({
  meta: {
    type: 'problem',
    docs: { description: 'Disallow session-level Postgres advisory locks in SQL strings.' },
    messages: {
      sessionLock:
        'pg_advisory_lock outlives the transaction on a pooled connection. Use pg_advisory_xact_lock (lockKey in apps/core-api/src/lib/locks.ts).',
    },
  },
  createOnce(context) {
    return {
      Literal(node) {
        if (typeof node.value === 'string' && SESSION_LOCK.test(node.value))
          context.report({ node, messageId: 'sessionLock' });
      },
      TemplateElement(node) {
        if (SESSION_LOCK.test(node.value.cooked ?? node.value.raw))
          context.report({ node, messageId: 'sessionLock' });
      },
    };
  },
});

const COMPARISONS = new Set(['eq', 'ne', 'inArray', 'notInArray']);

/** `x.orgId`, the organisation column of a table, or a value someone carries. */
const isOrgId = (node: ESTree.Node | undefined) =>
  node?.type === 'MemberExpression' &&
  node.property.type === 'Identifier' &&
  node.property.name === 'orgId';

/**
 * Row level security keeps every query in a `withOrg` scope to that organisation, so a filter
 * on org_id only repeats it. Comparing two tables' org_id columns (a join key) is fine; a
 * table's org_id against a value, in drizzle (`eq(customers.orgId, actor.orgId)`) or in SQL
 * (`where org_id = ${orgId}`), is reported.
 */
const noOrgFilterRule = defineRule({
  meta: {
    type: 'problem',
    docs: { description: 'Disallow org_id filters: row level security scopes every query.' },
    messages: {
      filter:
        "Row level security already keeps this query to the scope's organisation (withOrg), so delete the org_id filter. System work that needs one organisation's rows runs them in withOrg(orgId, ...) inside its withSystem scope.",
    },
  },
  createOnce(context) {
    // Tables: what a file imports from @erxes/core-db, and drizzle `alias(table, name)`es.
    const tables = new Set<string>();

    const isColumn = (node: ESTree.Node | undefined) =>
      node?.type === 'MemberExpression' &&
      node.object.type === 'Identifier' &&
      tables.has(node.object.name);

    return {
      Program() {
        tables.clear();
      },
      ImportDeclaration(node) {
        if (!node.source.value.startsWith('@erxes/core-db')) return;

        for (const specifier of node.specifiers) tables.add(specifier.local.name);
      },
      VariableDeclarator(node) {
        const { id, init } = node;

        if (
          id.type === 'Identifier' &&
          init?.type === 'CallExpression' &&
          init.callee.type === 'Identifier' &&
          init.callee.name === 'alias'
        )
          tables.add(id.name);
      },
      CallExpression(node) {
        if (node.callee.type !== 'Identifier' || !COMPARISONS.has(node.callee.name)) return;

        const [left, right] = node.arguments;

        // Any `x.orgId` counts (a table can come from a lookup, `LINKS[type]`); only a join
        // to a known table's column is allowed.
        const other = isOrgId(left) ? right : isOrgId(right) ? left : null;

        if (other && !isColumn(other)) context.report({ node, messageId: 'filter' });
      },
      TaggedTemplateExpression(node) {
        if (node.tag.type !== 'Identifier' || node.tag.name !== 'sql') return;

        const { quasis, expressions } = node.quasi;

        expressions.forEach((value, index) => {
          const before = quasis[index]?.value.raw ?? '';
          const between = quasis[index + 1]?.value.raw ?? '';
          const next = expressions[index + 1];

          // `org_id = ${value}`, or `${table.orgId} = ${value}`
          const filter =
            (/\borg_id\s*=\s*$/.test(before) && !isColumn(value)) ||
            (isOrgId(value) && /^\s*=\s*$/.test(between) && !isColumn(next));

          if (filter) context.report({ node, messageId: 'filter' });
        });
      },
    };
  },
});

/** Rules for erxes core's own conventions. */
const erxesPlugin = eslintCompatPlugin({
  meta: { name: 'erxes' },
  rules: {
    'no-inline-enum': noInlineEnumRule,
    'no-org-filter': noOrgFilterRule,
    'no-session-advisory-lock': noSessionAdvisoryLockRule,
  },
});

export default erxesPlugin;
