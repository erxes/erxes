import { defineRule } from 'vite-plus/lint/plugins';

import { arrayMethodTarget } from '../shared/array-method.ts';
import { isGlobalMethodCall } from '../shared/global-method.ts';

import type { ESTree } from 'vite-plus/lint/plugins';

const schemaMethods = new Set(['parse', 'safeParse', 'parseAsync', 'safeParseAsync']);

/** `Schema.parse(JSON.parse(text))`: the parsed value goes straight into a schema. */
function isSchemaArgument(node: ESTree.Node): boolean {
  let child = node;
  let parent = node.parent;

  while (parent?.type === 'ParenthesizedExpression') {
    child = parent;
    parent = parent.parent;
  }

  if (parent?.type !== 'CallExpression' || parent.arguments[0] !== child) return false;

  const callee = parent.callee;

  if (callee.type === 'Super' || callee.type === 'V8IntrinsicExpression') return false;
  const target = arrayMethodTarget(callee);

  return (
    target !== null &&
    schemaMethods.has(target.name) &&
    !(target.object.type === 'Identifier' && target.object.name === 'JSON')
  );
}

/** Require every `JSON.parse` result to be the direct argument of a zod `.parse`/`.safeParse`. */
export const jsonParseThroughSchemaRule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description: 'Require JSON.parse results to go straight into a zod .parse or .safeParse.',
    },
    messages: {
      unparsedJson:
        '`JSON.parse` returns an unchecked value. Pass it straight to a zod schema: `Schema.parse(JSON.parse(text))`.',
    },
  },
  createOnce(context) {
    return {
      CallExpression(node) {
        if (node.callee.type === 'Super' || node.callee.type === 'V8IntrinsicExpression') return;

        if (
          isGlobalMethodCall(context.sourceCode, node.callee, 'JSON', 'parse') &&
          !isSchemaArgument(node)
        ) {
          context.report({ node, messageId: 'unparsedJson' });
        }
      },
    };
  },
});
