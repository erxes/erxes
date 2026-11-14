import { defineRule, eslintCompatPlugin, type ESTree } from 'vite-plus/lint/plugins';
import { procedureOutputRule } from './procedure-output.ts';

const SESSION_LOCK = /\bpg_(try_)?advisory_lock(_shared)?\s*\(/i;

/**
 * erxes runs behind connection poolers, so a session-level advisory lock stays
 * on the pooled connection after the transaction that took it ends.
 */
const noSessionAdvisoryLockRule = defineRule({
  meta: {
    type: 'problem',
    docs: { description: 'Disallow session-level Postgres advisory locks in SQL strings.' },
    messages: {
      sessionLock:
        'pg_advisory_lock outlives the transaction on a pooled connection. Use pg_advisory_xact_lock, which the transaction releases.',
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

/** Where tables come from: core's `@erxes/core-db`, a plugin's `db/schema` module. */
const TABLE_MODULE = /^@erxes\/core-db(\/|$)|(^|\/)db\/schema(\.ts)?$/;

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
        "Row level security already keeps this query to the scope's organisation (withOrg), so delete the org_id filter. System work that needs one organisation's rows runs them in withOrg(orgId, ...).",
    },
  },
  createOnce(context) {
    // Tables: what a file imports from a table module, and drizzle `alias(table, name)`es.
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
        if (!TABLE_MODULE.test(node.source.value)) return;

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
        let other: ESTree.Node | undefined;

        if (isOrgId(left)) other = right;
        else if (isOrgId(right)) other = left;

        if (other && !isColumn(other)) context.report({ node, messageId: 'filter' });
      },
      TaggedTemplateExpression(node) {
        if (node.tag.type !== 'Identifier' || node.tag.name !== 'sql') return;

        const { quasis, expressions } = node.quasi;

        expressions.forEach((value, index) => {
          const before = quasis[index]?.value.raw ?? '';
          const between = quasis[index + 1]?.value.raw ?? '';
          const next = expressions[index + 1];

          // `org_id = ${value}`, `${value} = org_id` (quoted too), or
          // `${table.orgId} = ${value}` either way round.
          const pair = /^\s*=\s*$/.test(between) && next;

          const filter =
            (!isColumn(value) &&
              (/\borg_id"?\s*=\s*$/.test(before) || /^\s*=\s*"?org_id\b/.test(between))) ||
            (pair && ((isOrgId(value) && !isColumn(next)) || (isOrgId(next) && !isColumn(value))));

          if (filter) context.report({ node, messageId: 'filter' });
        });
      },
    };
  },
});

const isUndefined = (node: ESTree.Node) => node.type === 'Identifier' && node.name === 'undefined';

const isEmptyObject = (node: ESTree.Node) =>
  node.type === 'ObjectExpression' && node.properties.length === 0;

/**
 * `...(input.x !== undefined ? { x: input.x } : {})` repeats what Drizzle does: `.set()` and
 * `.values()` skip undefined keys. Pass the input on.
 */
const noUndefinedSpreadRule = defineRule({
  meta: {
    type: 'suggestion',
    docs: { description: 'Disallow spreading a key only when it is not undefined.' },
    messages: {
      spread:
        "Drizzle's .set() and .values() skip undefined keys: pass the input (or its rest) as it is.",
    },
  },
  createOnce(context) {
    return {
      SpreadElement(node) {
        const spread = node.argument;

        if (spread.type !== 'ConditionalExpression' || spread.test.type !== 'BinaryExpression')
          return;

        const { operator, left, right } = spread.test;
        const againstUndefined = isUndefined(left) || isUndefined(right);
        const empty = operator === '!==' ? spread.alternate : spread.consequent;

        if ((operator === '!==' || operator === '===') && againstUndefined && isEmptyObject(empty))
          context.report({ node, messageId: 'spread' });
      },
    };
  },
});

const DTO_MAPPER = /^to[A-Z]\w*Dto$/;

/**
 * Services return rows and the procedure's output schema picks and encodes them; a value the row
 * lacks comes from the query (`select({ ...})`). A `to…Dto` mapper reshapes rows by hand.
 */
const noDtoMapperRule = defineRule({
  meta: {
    type: 'problem',
    docs: { description: 'Disallow to…Dto row mappers.' },
    messages: {
      mapper:
        'Return the row: the output schema (createSelectSchema(table).pick) picks and encodes it. Select a value the row lacks in the query.',
    },
  },
  createOnce(context) {
    return {
      VariableDeclarator(node) {
        if (node.id.type === 'Identifier' && DTO_MAPPER.test(node.id.name))
          context.report({ node, messageId: 'mapper' });
      },
      FunctionDeclaration(node) {
        if (node.id && DTO_MAPPER.test(node.id.name)) context.report({ node, messageId: 'mapper' });
      },
    };
  },
});

const KEY_EVENTS = new Set(['keydown', 'keyup', 'keypress']);

/** `x.addEventListener('keydown', ...)`: shortcuts go through react-hotkeys-hook. */
const noKeyListenerRule = defineRule({
  meta: {
    type: 'suggestion',
    docs: { description: 'Disallow raw keyboard listeners: shortcuts use react-hotkeys-hook.' },
    messages: {
      listener:
        "Bind keys with useHotkeys from 'react-hotkeys-hook', or erxes-ui's useScopedHotkeys, which skip typing in inputs and editors.",
    },
  },
  createOnce(context) {
    return {
      CallExpression(node) {
        const { callee } = node;
        const [event] = node.arguments;

        if (
          callee.type === 'MemberExpression' &&
          callee.property.type === 'Identifier' &&
          callee.property.name === 'addEventListener' &&
          event?.type === 'Literal' &&
          typeof event.value === 'string' &&
          KEY_EVENTS.has(event.value)
        )
          context.report({ node, messageId: 'listener' });
      },
    };
  },
});

/** Rules for how erxes code talks to Postgres, shapes API output and binds keys, in core and plugins. */
const erxesPlugin = eslintCompatPlugin({
  meta: { name: 'erxes' },
  rules: {
    'no-dto-mapper': noDtoMapperRule,
    'no-key-listener': noKeyListenerRule,
    'no-org-filter': noOrgFilterRule,
    'no-session-advisory-lock': noSessionAdvisoryLockRule,
    'no-undefined-spread': noUndefinedSpreadRule,
    'procedure-output': procedureOutputRule,
  },
});

export default erxesPlugin;
