type Entry<T> = {
  value?: T;
  freshUntil: number;
  staleUntil: number;
  pending?: Promise<T>;
};

type SharedCacheOptions<T> = {
  ttlMs: number;
  staleMs: number;
  maxEntries: number;
  keep: (value: T) => boolean;
  timedOut: () => T;
};

const LOAD_TIMEOUT_MS = 30_000;

export const TIMED_OUT = 'The help center API did not answer in time.';

const withTimeout = <T>(promise: Promise<T>, onTimeout: () => T) => {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(onTimeout()), LOAD_TIMEOUT_MS);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

export const createSharedCache = <T>({
  ttlMs,
  staleMs,
  maxEntries,
  keep,
  timedOut,
}: SharedCacheOptions<T>) => {
  const entries = new Map<string, Entry<T>>();

  const sweep = (now: number) => {
    for (const [key, entry] of entries) {
      if (!entry.pending && entry.staleUntil <= now) {
        entries.delete(key);
      }
    }

    for (const key of entries.keys()) {
      if (entries.size < maxEntries) {
        break;
      }

      entries.delete(key);
    }
  };

  const entryFor = (key: string, now: number): Entry<T> => {
    const existing = entries.get(key);

    if (existing) {
      entries.delete(key);
      entries.set(key, existing);

      return existing;
    }

    sweep(now);

    const created: Entry<T> = { freshUntil: 0, staleUntil: 0 };
    entries.set(key, created);

    return created;
  };

  const refresh = (entry: Entry<T>, load: () => Promise<T>): Promise<T> => {
    if (entry.pending) {
      return entry.pending;
    }

    const pending = withTimeout(load(), timedOut)
      .then((value) => {
        if (keep(value)) {
          const now = Date.now();

          entry.value = value;
          entry.freshUntil = now + ttlMs;
          entry.staleUntil = now + ttlMs + staleMs;
        }

        return value;
      })
      .finally(() => {
        entry.pending = undefined;
      });

    entry.pending = pending;

    return pending;
  };

  return (key: string, load: () => Promise<T>): Promise<T> => {
    const now = Date.now();
    const entry = entryFor(key, now);

    if (entry.value !== undefined && now < entry.freshUntil) {
      return Promise.resolve(entry.value);
    }

    if (entry.value !== undefined && now < entry.staleUntil) {
      refresh(entry, load).catch(() => undefined);

      return Promise.resolve(entry.value);
    }

    return refresh(entry, load);
  };
};
