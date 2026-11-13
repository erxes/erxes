import { defineRule } from 'vite-plus/lint/plugins';

import { arrayMethodTarget } from '../shared/array-method.ts';

import type { ESTree } from 'vite-plus/lint/plugins';

/** `z.<name>(...)` with `z` as written in the source. */
function zodCall(node: ESTree.Node, name: string): node is ESTree.CallExpression {
  if (node.type !== 'CallExpression') return false;

  if (node.callee.type === 'Super' || node.callee.type === 'V8IntrinsicExpression') return false;
  const target = arrayMethodTarget(node.callee);

  return target?.name === name && target.object.type === 'Identifier' && target.object.name === 'z';
}

/** Ban `z.any()` and records of `z.unknown()`, which give the API no shape. */
export const noUntypedZodRule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow z.any() and z.record(..., z.unknown()); describe the shape, or use the named JSON blob schema.',
    },
    messages: {
      any: '`z.any()` turns type checking off for this field. Describe the shape, or use `z.unknown()` and parse it where it is read.',
      unknownRecord:
        'A record of `z.unknown()` gives the API no shape. Describe the fields, or use the named JSON blob schema for data the API stores without reading.',
    },
  },
  createOnce(context) {
    return {
      CallExpression(node) {
        if (zodCall(node, 'any')) context.report({ node, messageId: 'any' });

        const value = node.arguments.at(-1);

        if (zodCall(node, 'record') && value !== undefined && zodCall(value, 'unknown')) {
          context.report({ node, messageId: 'unknownRecord' });
        }
      },
    };
  },
});
