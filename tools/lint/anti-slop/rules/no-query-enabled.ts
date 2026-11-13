import { defineRule } from 'vite-plus/lint/plugins';

import { arrayMethodTarget } from '../shared/array-method.ts';

const optionBuilders = new Set(['queryOptions', 'infiniteOptions']);

/** Ban `enabled` in oRPC query options: `skipToken` as the input disables the query and keeps the input typed. */
export const noQueryEnabledRule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow `enabled` in oRPC queryOptions(...); pass skipToken as the input.',
    },
    messages: {
      queryEnabled:
        "Don't pass `enabled` to `queryOptions`. Pass `input: ready ? { ...input } : skipToken` (skipToken from '@tanstack/react-query'), so the input never holds placeholder values.",
    },
  },
  createOnce(context) {
    return {
      CallExpression(node) {
        if (node.callee.type === 'Super' || node.callee.type === 'V8IntrinsicExpression') return;
        const name = arrayMethodTarget(node.callee)?.name;
        const options = node.arguments[0];

        if (
          name === undefined ||
          !optionBuilders.has(name) ||
          options?.type !== 'ObjectExpression'
        ) {
          return;
        }

        for (const property of options.properties) {
          if (
            property.type === 'Property' &&
            !property.computed &&
            ((property.key.type === 'Identifier' && property.key.name === 'enabled') ||
              (property.key.type === 'Literal' && property.key.value === 'enabled'))
          ) {
            context.report({ node: property, messageId: 'queryEnabled' });
          }
        }
      },
    };
  },
});
