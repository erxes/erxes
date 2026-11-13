import { resolveVariable } from './scope.ts';

import type { ESTree, SourceCode } from 'vite-plus/lint/plugins';

function isGlobal(sourceCode: SourceCode, expression: ESTree.Expression, name: string): boolean {
  if (expression.type !== 'Identifier' || expression.name !== name) return false;

  if (sourceCode.isGlobalReference(expression)) return true;
  const variable = resolveVariable(sourceCode, expression);

  return variable === null || variable.defs.length === 0;
}

/** Reports whether a call target names one method on a global object, such as `Reflect.get`. */
export function isGlobalMethodCall(
  sourceCode: SourceCode,
  callee: ESTree.Expression,
  objectName: string,
  methodName: string,
): boolean {
  if (!('property' in callee) || !('object' in callee) || !('computed' in callee)) return false;

  if (!isGlobal(sourceCode, callee.object, objectName)) return false;
  const property = callee.property;

  return callee.computed
    ? property.type === 'Literal' && property.value === methodName
    : property.type === 'Identifier' && property.name === methodName;
}
