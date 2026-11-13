import { defineRule } from 'vite-plus/lint/plugins';

import { arrayMethodTarget } from '../shared/array-method.ts';

/** Ban drizzle's `sql.raw`, which splices a string into SQL unescaped. */
export const noSqlRawRule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow sql.raw outside the files an override allows; build SQL from parameters and sql.identifier.',
    },
    messages: {
      sqlRaw:
        '`sql.raw` puts the string into SQL as is. Use a parameter (`sql`${value}``), `sql.identifier`, a column reference or a fixed `sql` fragment. Files that must run SQL text (migrations, DDL scripts) are allowed by an override in vite.config.ts.',
    },
  },
  createOnce(context) {
    return {
      CallExpression(node) {
        if (node.callee.type === 'Super' || node.callee.type === 'V8IntrinsicExpression') return;
        const target = arrayMethodTarget(node.callee);

        if (
          target?.name === 'raw' &&
          target.object.type === 'Identifier' &&
          target.object.name === 'sql'
        ) {
          context.report({ node, messageId: 'sqlRaw' });
        }
      },
    };
  },
});
