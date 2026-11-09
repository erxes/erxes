export interface ISchemaCacheOptions {
  maxEntries: number;
  idleTtlMs: number;
  /** Rebuild even busy entries after this long, bounding staleness. */
  maxAgeMs: number;
  maxConcurrentBuilds: number;
  maxQueuedBuilds: number;
  now?: () => number;
}

export interface ISchemaCacheStats {
  entries: number;
  hits: number;
  misses: number;
  evictions: number;
  builds: number;
  buildErrors: number;
  dedupedWaits: number;
  rejectedBuilds: number;
  activeBuilds: number;
  queuedBuilds: number;
}

export class SchemaCacheOverloadedError extends Error {
  readonly code = 'SERVICE_UNAVAILABLE';

  constructor() {
    super('Data Extensions is busy building schemas; retry shortly');
    Object.setPrototypeOf(this, SchemaCacheOverloadedError.prototype);
  }
}

interface IEntry<T> {
  value: T;
  builtAt: number;
  lastUsedAt: number;
}

/**
 * Process-local LRU for generated schemas. Keys carry tenant, metadata
 * version and engine version, so a new version is simply a new key and old
 * ones age out. Concurrent misses for one key share a single build, and the
 * number of builds running or waiting is capped.
 */
export class SchemaCache<T> {
  private readonly entries = new Map<string, IEntry<T>>();
  private readonly inFlight = new Map<string, Promise<T>>();
  private readonly waiters: (() => void)[] = [];
  private activeBuilds = 0;
  private readonly now: () => number;
  private readonly counters = {
    hits: 0,
    misses: 0,
    evictions: 0,
    builds: 0,
    buildErrors: 0,
    dedupedWaits: 0,
    rejectedBuilds: 0,
  };

  constructor(private readonly options: ISchemaCacheOptions) {
    this.now = options.now || Date.now;
  }

  async get(key: string, build: () => Promise<T>): Promise<T> {
    const entry = this.entries.get(key);

    if (entry && this.isFresh(entry)) {
      this.counters.hits++;
      entry.lastUsedAt = this.now();
      // Re-insert to mark as most recently used.
      this.entries.delete(key);
      this.entries.set(key, entry);

      return entry.value;
    }

    if (entry) {
      this.entries.delete(key);
      this.counters.evictions++;
    }

    const pending = this.inFlight.get(key);

    if (pending) {
      this.counters.dedupedWaits++;
      return pending;
    }

    this.counters.misses++;

    const promise = this.runBuild(key, build).finally(() => {
      this.inFlight.delete(key);
    });

    this.inFlight.set(key, promise);

    return promise;
  }

  /** Drops idle or expired entries; called on a timer. */
  sweep(): void {
    for (const [key, entry] of this.entries) {
      if (!this.isFresh(entry)) {
        this.entries.delete(key);
        this.counters.evictions++;
      }
    }
  }

  stats(): ISchemaCacheStats {
    return {
      entries: this.entries.size,
      ...this.counters,
      activeBuilds: this.activeBuilds,
      queuedBuilds: this.waiters.length,
    };
  }

  private isFresh(entry: IEntry<T>) {
    const now = this.now();

    return (
      now - entry.lastUsedAt <= this.options.idleTtlMs &&
      now - entry.builtAt <= this.options.maxAgeMs
    );
  }

  private async runBuild(key: string, build: () => Promise<T>): Promise<T> {
    await this.acquire();

    try {
      this.counters.builds++;
      const value = await build();

      this.entries.set(key, {
        value,
        builtAt: this.now(),
        lastUsedAt: this.now(),
      });
      this.evictOverflow();

      return value;
    } catch (error) {
      this.counters.buildErrors++;
      throw error;
    } finally {
      this.release();
    }
  }

  private evictOverflow() {
    while (this.entries.size > this.options.maxEntries) {
      const oldest = this.entries.keys().next().value;

      if (oldest === undefined) {
        return;
      }

      this.entries.delete(oldest);
      this.counters.evictions++;
    }
  }

  private acquire(): Promise<void> {
    if (this.activeBuilds < this.options.maxConcurrentBuilds) {
      this.activeBuilds++;
      return Promise.resolve();
    }

    if (this.waiters.length >= this.options.maxQueuedBuilds) {
      this.counters.rejectedBuilds++;
      return Promise.reject(new SchemaCacheOverloadedError());
    }

    return new Promise((resolve) => {
      this.waiters.push(() => {
        this.activeBuilds++;
        resolve();
      });
    });
  }

  private release() {
    this.activeBuilds--;
    this.waiters.shift()?.();
  }
}
