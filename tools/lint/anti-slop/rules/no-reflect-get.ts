import { defineRule } from 'vite-plus/lint/plugins';

import { isGlobalMethodCall } from '../shared/global-method.ts';

/** Ban Reflect.get, which bypasses ordinary property access and useful type evidence. */
export const noReflectGetRule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow Reflect.get; use typed property access or parse dynamic input into a domain type.',
    },
    messages: {
      reflectGet:
        'Replace `Reflect.get` with typed property access. Parse dynamic input into a named domain type before reading it.',
    },
  },
  createOnce(context) {
    return {
      CallExpression(node) {
        if (node.callee.type === 'Super' || node.callee.type === 'V8IntrinsicExpression') return;

        if (isGlobalMethodCall(context.sourceCode, node.callee, 'Reflect', 'get')) {
          context.report({ node, messageId: 'reflectGet' });
        }
      },
    };
  },
});
