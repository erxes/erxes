import { defineRule, type ESTree } from 'vite-plus/lint/plugins';

/** Whether a builder chain (`reads(...).input(...).output(...)`) declares an output schema. */
const declaresOutput = (start: ESTree.Expression): boolean => {
  let node: ESTree.Node = start;

  while (node.type === 'CallExpression' && node.callee.type === 'MemberExpression') {
    const { property } = node.callee;

    if (property.type === 'Identifier' && property.name === 'output') return true;

    node = node.callee.object;
  }

  return false;
};

/**
 * A plugin procedure (`reads(...)...handler(fn)`) declares `.output()`, built from its table
 * (`createSelectSchema(table).omit({ orgId: true })`), so it answers with flat rows and no hand
 * mapper reshapes them. Only chains that start from a builder call are checked: core's
 * contract-implemented handlers (`scoped.tags.list.handler`) get their output from the contract.
 */
export const procedureOutputRule = defineRule({
  meta: {
    type: 'problem',
    docs: { description: 'Require .output() on oRPC procedures built in a plugin.' },
    messages: {
      output:
        'Declare .output(): createSelectSchema(table).omit({ orgId: true }), with .extend() for values the query selects. The handler returns the rows.',
    },
  },
  createOnce(context) {
    return {
      CallExpression(node) {
        const { callee } = node;

        if (
          callee.type !== 'MemberExpression' ||
          callee.property.type !== 'Identifier' ||
          callee.property.name !== 'handler' ||
          callee.object.type !== 'CallExpression'
        )
          return;

        if (!declaresOutput(callee.object)) context.report({ node, messageId: 'output' });
      },
    };
  },
});
