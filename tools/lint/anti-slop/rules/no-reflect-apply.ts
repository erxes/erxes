import { defineRule } from 'vite-plus/lint/plugins';

import { isGlobalMethodCall } from '../shared/global-method.ts';

/** Ban Reflect.apply, which bypasses ordinary typed function calls. */
export const noReflectApplyRule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow Reflect.apply; call typed functions directly or model dynamic dispatch behind an interface.',
    },
    messages: {
      reflectApply:
        'Replace `Reflect.apply` with a typed function call. Model dynamic dispatch behind a named interface.',
    },
  },
  createOnce(context) {
    return {
      CallExpression(node) {
        if (node.callee.type === 'Super' || node.callee.type === 'V8IntrinsicExpression') return;

        if (isGlobalMethodCall(context.sourceCode, node.callee, 'Reflect', 'apply')) {
          context.report({ node, messageId: 'reflectApply' });
        }
      },
    };
  },
});
