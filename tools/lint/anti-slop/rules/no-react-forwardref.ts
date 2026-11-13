import { defineRule } from 'vite-plus/lint/plugins';

import { arrayMethodTarget } from '../shared/array-method.ts';

/** Ban `React.forwardRef`, the member access that a `no-restricted-imports` ban on `forwardRef` misses. */
export const noReactForwardRefRule = defineRule({
  meta: {
    type: 'problem',
    docs: { description: 'Disallow React.forwardRef; React 19 passes ref as a prop.' },
    messages: { forwardRef: 'React 19: take `ref` from the props instead of `React.forwardRef`.' },
  },
  createOnce(context) {
    return {
      MemberExpression(node) {
        const target = arrayMethodTarget(node);

        if (
          target?.name === 'forwardRef' &&
          target.object.type === 'Identifier' &&
          target.object.name === 'React'
        ) {
          context.report({ node, messageId: 'forwardRef' });
        }
      },
    };
  },
});
