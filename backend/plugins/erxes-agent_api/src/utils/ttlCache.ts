/**
 * A minimal in-memory cache with per-entry time-to-live expiry.
 *
 * Entries are evicted lazily: an expired value is dropped on the next `get`,
 * which returns `undefined` once `Date.now() - at >= ttlMs`. Keyed by string;
 * generic over the stored value type. Functional (no class) so callers can
 * share a single helper instead of re-rolling `Map` + `Date.now()` math.
 */
export const createTTLCache = <V>(ttlMs: number) => {
  const store = new Map<string, { value: V; at: number }>();

  const get = (key: string): V | undefined => {
    const entry = store.get(key);

    if (!entry) {
      return undefined;
    }

    if (Date.now() - entry.at >= ttlMs) {
      store.delete(key);
      return undefined;
    }

    return entry.value;
  };

  const set = (key: string, value: V): void => {
    store.set(key, { value, at: Date.now() });
  };

  const del = (key: string): void => {
    store.delete(key);
  };

  const clear = (): void => {
    store.clear();
  };

  return { get, set, delete: del, clear };
};
