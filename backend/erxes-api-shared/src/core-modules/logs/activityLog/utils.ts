import { Resolver } from './types';

export function matchesFieldPattern(pattern: string, field: string) {
  if (pattern === field) {
    return true;
  }

  if (pattern.endsWith('.*')) {
    const prefix = pattern.slice(0, -2);
    return field.startsWith(`${prefix}.`);
  }

  return false;
}

export function findResolver<TResult = any>(
  field: string,
  resolvers: Record<string, Resolver<TResult>>,
): Resolver<TResult> | undefined {
  for (const key of Object.keys(resolvers)) {
    if (key === '$default') {
      continue;
    }

    if (matchesFieldPattern(key, field)) {
      return resolvers[key];
    }
  }

  return resolvers.$default;
}

export function detectAssignmentDelta(prev: unknown, current: unknown) {
  const prevIds = Array.isArray(prev) ? prev.map(String) : [];
  const currentIds = Array.isArray(current) ? current.map(String) : [];

  const prevSet = new Set(prevIds);
  const currentSet = new Set(currentIds);

  return {
    added: currentIds.filter((id) => !prevSet.has(id)),
    removed: prevIds.filter((id) => !currentSet.has(id)),
  };
}

export function getSnapshot(doc: any) {
  return typeof doc?.toObject === 'function' ? doc.toObject() : doc;
}
