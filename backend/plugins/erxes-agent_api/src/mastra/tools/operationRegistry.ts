import {
  fetchAvailableErxesTools,
  fetchInputTypesMap,
  fetchObjectFieldsMap,
} from './erxesTools';

// One discovered erxes GraphQL operation (query or mutation) the agent can run.
export interface OperationMeta {
  operation: string;
  operationType: 'query' | 'mutation';
  plugin: string;
  module: string;
  description: string;
  graphqlArgs: any[];
  returnType: any;
}

// The full, live picture of what the agent can do, derived from schema
// introspection. `operations` is a name → meta lookup for O(1) execute resolution;
// `list` is the same set for searching. The two type maps power argument-schema
// building (inputTypesMap) and response-field selection (objectFieldsMap).
export interface OperationRegistry {
  operations: Map<string, OperationMeta>;
  list: OperationMeta[];
  inputTypesMap: Record<string, any[]>;
  objectFieldsMap: Record<string, any[]>;
}

interface CacheEntry {
  reg: OperationRegistry;
  at: number;
}

// Schema introspection is identical for every user (it's the gateway's shape,
// not tenant data), so the registry is cached per API URL + app token with a
// short TTL. This replaces the old per-operation MastraTool collection: the
// agent's capabilities are now always derived from the live schema, no manual
// "sync" step required.
const cache = new Map<string, CacheEntry>();
const TTL_MS = 15 * 60 * 1000;

function cacheKey(settings: any): string {
  const apiUrl = settings?.erxesApiUrl || 'http://localhost:4000';
  const token = settings?.erxesApiToken || '';
  return `${apiUrl}::${token}`;
}

function buildRegistry(
  operations: OperationMeta[],
  inputTypesMap: Record<string, any[]>,
  objectFieldsMap: Record<string, any[]>,
): OperationRegistry {
  const map = new Map<string, OperationMeta>();
  for (const op of operations) map.set(op.operation, op);
  return { operations: map, list: operations, inputTypesMap, objectFieldsMap };
}

/**
 * Returns the cached operation registry for these settings, refreshing it from
 * a live schema introspection when stale (or absent).
 *
 * Resilience: if introspection transiently returns zero operations we keep
 * serving the previous (stale) registry rather than caching an empty one, so a
 * blip in the gateway never wipes an agent's capabilities mid-conversation.
 */
export async function getOperationRegistry(
  settings: any,
  opts: { force?: boolean } = {},
): Promise<OperationRegistry> {
  const key = cacheKey(settings);
  const hit = cache.get(key);
  const fresh = hit && Date.now() - hit.at < TTL_MS;
  if (hit && fresh && !opts.force) return hit.reg;

  try {
    const [operations, inputTypesMap, objectFieldsMap] = await Promise.all([
      fetchAvailableErxesTools(settings),
      fetchInputTypesMap(settings),
      fetchObjectFieldsMap(settings),
    ]);

    if (!operations.length && hit) {
      // Introspection failed/empty — serve the last good registry.
      return hit.reg;
    }

    const reg = buildRegistry(
      operations as OperationMeta[],
      inputTypesMap,
      objectFieldsMap,
    );
    cache.set(key, { reg, at: Date.now() });
    return reg;
  } catch {
    if (hit) return hit.reg;
    return buildRegistry([], {}, {});
  }
}

export function invalidateOperationRegistry(settings?: any) {
  if (settings) cache.delete(cacheKey(settings));
  else cache.clear();
}
