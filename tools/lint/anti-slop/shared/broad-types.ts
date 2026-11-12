import type { ESTree } from 'vite-plus/lint/plugins';

/** How a type annotation is broad: `unknown`/`any`, `object`, or a string-keyed record of them. */
export type BroadTypeKind = 'top' | 'object' | 'record';

export function unwrapTypeParentheses(type: ESTree.TSType): ESTree.TSType {
  let current = type;

  while (current.type === 'TSParenthesizedType') current = current.typeAnnotation;

  return current;
}

function typeReferenceName(type: ESTree.TSTypeReference): string | null {
  return type.typeName.type === 'Identifier' ? type.typeName.name : null;
}

function isUnknownOrAnyType(type: ESTree.TSType): boolean {
  const unwrapped = unwrapTypeParentheses(type);

  return unwrapped.type === 'TSUnknownKeyword' || unwrapped.type === 'TSAnyKeyword';
}

function isBroadRecordKeyType(type: ESTree.TSType): boolean {
  const unwrapped = unwrapTypeParentheses(type);

  if (
    unwrapped.type === 'TSStringKeyword' ||
    unwrapped.type === 'TSNumberKeyword' ||
    unwrapped.type === 'TSSymbolKeyword'
  ) {
    return true;
  }

  if (unwrapped.type === 'TSUnionType') return unwrapped.types.every(isBroadRecordKeyType);

  return unwrapped.type === 'TSTypeReference' && typeReferenceName(unwrapped) === 'PropertyKey';
}

function isBroadRecordType(type: ESTree.TSType): boolean {
  const unwrapped = unwrapTypeParentheses(type);

  if (unwrapped.type === 'TSTypeReference') {
    if (typeReferenceName(unwrapped) === 'Readonly') {
      const [inner] = unwrapped.typeArguments?.params ?? [];

      return inner !== undefined && isBroadRecordType(inner);
    }

    if (typeReferenceName(unwrapped) !== 'Record') return false;
    const parameters = unwrapped.typeArguments?.params ?? [];

    return (
      parameters.length === 2 &&
      parameters[0] !== undefined &&
      parameters[1] !== undefined &&
      isBroadRecordKeyType(parameters[0]) &&
      isUnknownOrAnyType(parameters[1])
    );
  }

  if (unwrapped.type !== 'TSTypeLiteral' || unwrapped.members.length !== 1) return false;
  const [member] = unwrapped.members;
  const [parameter] = member?.type === 'TSIndexSignature' ? member.parameters : [];

  return (
    member?.type === 'TSIndexSignature' &&
    member.parameters.length === 1 &&
    parameter !== undefined &&
    isBroadRecordKeyType(parameter.typeAnnotation.typeAnnotation) &&
    isUnknownOrAnyType(member.typeAnnotation.typeAnnotation)
  );
}

export function broadTypeKind(type: ESTree.TSType): BroadTypeKind | null {
  const unwrapped = unwrapTypeParentheses(type);

  if (unwrapped.type === 'TSUnknownKeyword' || unwrapped.type === 'TSAnyKeyword') return 'top';

  if (unwrapped.type === 'TSObjectKeyword') return 'object';

  return isBroadRecordType(unwrapped) ? 'record' : null;
}

function normalizedTypeText(sourceText: string, type: ESTree.TSType): string {
  return sourceText.slice(type.start, type.end).replaceAll(/\s+/gu, '');
}

export function typesHaveSameSyntax(
  sourceText: string,
  left: ESTree.TSType | null,
  right: ESTree.TSType,
): boolean {
  return (
    left !== null &&
    normalizedTypeText(sourceText, unwrapTypeParentheses(left)) ===
      normalizedTypeText(sourceText, unwrapTypeParentheses(right))
  );
}

export function isDefinitelyObjectType(type: ESTree.TSType): boolean {
  const unwrapped = unwrapTypeParentheses(type);

  switch (unwrapped.type) {
    case 'TSArrayType':
    case 'TSConstructorType':
    case 'TSFunctionType':
    case 'TSMappedType':
    case 'TSObjectKeyword':
    case 'TSTupleType':
      return true;
    case 'TSTypeLiteral':
      return unwrapped.members.length > 0;
    case 'TSIntersectionType':
      return unwrapped.types.every(isDefinitelyObjectType);
    case 'TSTypeOperator':
      return unwrapped.operator === 'readonly' && isDefinitelyObjectType(unwrapped.typeAnnotation);
    default:
      return false;
  }
}

export function isDefinitelyNarrowerRecordType(type: ESTree.TSType): boolean {
  const unwrapped = unwrapTypeParentheses(type);

  if (unwrapped.type === 'TSTypeLiteral') {
    return unwrapped.members.some((member) => member.type !== 'TSIndexSignature');
  }

  if (unwrapped.type !== 'TSTypeReference') return false;

  if (typeReferenceName(unwrapped) === 'Readonly') {
    const [inner] = unwrapped.typeArguments?.params ?? [];

    return inner !== undefined && isDefinitelyNarrowerRecordType(inner);
  }

  if (typeReferenceName(unwrapped) !== 'Record') return false;

  const parameters = unwrapped.typeArguments?.params ?? [];

  return (
    parameters.length === 2 && parameters[1] !== undefined && !isUnknownOrAnyType(parameters[1])
  );
}
