import { createTTLCache } from '~/utils/ttlCache';
import {
  fetchAvailableErxesTools,
  fetchInputTypesMap,
  fetchObjectFieldsMap,
  type ErxesToolSettings,
  type GqlArgDef,
  type GqlFieldDef,
  type GqlTypeRef,
} from './erxesTools';

// One discovered erxes GraphQL operation (query or mutation) the agent can run.
export interface OperationMeta {
  operation: string;
  operationType: 'query' | 'mutation';
  plugin: string;
  module: string;
  description: string;
  graphqlArgs: GqlArgDef[];
  returnType?: GqlTypeRef | null;
}

// The full, live picture of what the agent can do, derived from schema
// introspection. `operations` is a name → meta lookup for O(1) execute resolution;
// `list` is the same set for searching. The two type maps power argument-schema
// building (inputTypesMap) and response-field selection (objectFieldsMap).
export interface OperationRegistry {
  operations: Map<string, OperationMeta>;
  list: OperationMeta[];
  inputTypesMap: Record<string, GqlArgDef[]>;
  objectFieldsMap: Record<string, GqlFieldDef[]>;
}

// Schema introspection is identical for every user (it's the gateway's shape,
// not tenant data), so the registry is cached per API URL + app token with a
// short TTL. This replaces the old per-operation MastraTool collection: the
// agent's capabilities are now always derived from the live schema, no manual
// "sync" step required.
const TTL_MS = 15 * 60 * 1000;
const cache = createTTLCache<OperationRegistry>(TTL_MS);

// Resilience tier: the last successfully built registry per key, never expired.
// When a live introspection transiently returns zero operations (or throws) we
// serve this rather than wiping an agent's capabilities mid-conversation.
const lastGood = new Map<string, OperationRegistry>();

/** Cache key for a registry: one entry per API URL + app token pair. */
function cacheKey(settings: ErxesToolSettings | null | undefined): string {
  const apiUrl = settings?.erxesApiUrl || 'http://localhost:4000';
  const token = settings?.erxesApiToken || '';
  return `${apiUrl}::${token}`;
}

/** Assemble the registry struct (name → meta map + search list + type maps). */
function buildRegistry(
  operations: OperationMeta[],
  inputTypesMap: Record<string, GqlArgDef[]>,
  objectFieldsMap: Record<string, GqlFieldDef[]>,
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
  settings: ErxesToolSettings | null,
  opts: { force?: boolean } = {},
): Promise<OperationRegistry> {
  const key = cacheKey(settings);
  const fresh = cache.get(key);
  if (fresh && !opts.force) return fresh;

  const previous = lastGood.get(key);

  try {
    const [operations, inputTypesMap, objectFieldsMap] = await Promise.all([
      fetchAvailableErxesTools(settings),
      fetchInputTypesMap(settings),
      fetchObjectFieldsMap(settings),
    ]);

    if (!operations.length && previous) {
      // Introspection failed/empty — serve the last good registry.
      return previous;
    }

    const reg = buildRegistry(operations, inputTypesMap, objectFieldsMap);
    cache.set(key, reg);
    lastGood.set(key, reg);
    return reg;
  } catch {
    if (previous) return previous;
    return buildRegistry([], {}, {});
  }
}

/** Drop the cached registry for these settings (or all registries when omitted). */
export function invalidateOperationRegistry(
  settings?: ErxesToolSettings | null,
) {
  if (settings) {
    const key = cacheKey(settings);
    cache.delete(key);
    lastGood.delete(key);
  } else {
    cache.clear();
    lastGood.clear();
  }
}
