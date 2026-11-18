import { SchemaCache, SchemaCacheOverloadedError } from './cache';

const createCache = (
  overrides: Partial<ConstructorParameters<typeof SchemaCache>[0]> = {},
) => {
  let now = 0;
  const cache = new SchemaCache<string>({
    maxEntries: 2,
    idleTtlMs: 1000,
    maxAgeMs: 5000,
    maxConcurrentBuilds: 1,
    maxQueuedBuilds: 1,
    now: () => now,
    ...overrides,
  });

  return { cache, advance: (ms: number) => (now += ms) };
};

describe('SchemaCache', () => {
  it('keys tenants and versions separately', async () => {
    const { cache } = createCache({ maxEntries: 10 });

    await cache.get('tenant-a:1', async () => 'a1');
    await cache.get('tenant-b:1', async () => 'b1');

    expect(await cache.get('tenant-a:1', async () => 'wrong')).toBe('a1');
    expect(await cache.get('tenant-b:1', async () => 'wrong')).toBe('b1');
    expect(await cache.get('tenant-a:2', async () => 'a2')).toBe('a2');
  });

  it('shares one build between concurrent misses', async () => {
    const { cache } = createCache();
    let builds = 0;
    const build = async () => {
      builds++;
      return 'schema';
    };

    const results = await Promise.all([
      cache.get('k', build),
      cache.get('k', build),
      cache.get('k', build),
    ]);

    expect(results).toEqual(['schema', 'schema', 'schema']);
    expect(builds).toBe(1);
    expect(cache.stats().dedupedWaits).toBe(2);
  });

  it('evicts the least recently used entry past the limit', async () => {
    const { cache } = createCache();

    await cache.get('a', async () => 'a');
    await cache.get('b', async () => 'b');
    await cache.get('a', async () => 'a');
    await cache.get('c', async () => 'c');

    expect(await cache.get('a', async () => 'rebuilt')).toBe('a');
    expect(await cache.get('b', async () => 'rebuilt')).toBe('rebuilt');
  });

  it('expires idle entries', async () => {
    const { cache, advance } = createCache();

    await cache.get('a', async () => 'old');
    advance(1500);
    cache.sweep();

    expect(cache.stats().entries).toBe(0);
    expect(await cache.get('a', async () => 'new')).toBe('new');
  });

  it('rebuilds busy entries once they pass the max age', async () => {
    const { cache, advance } = createCache();

    await cache.get('a', async () => 'v1');

    for (let step = 0; step < 6; step++) {
      advance(900);
      await cache.get('a', async () => 'v2');
    }

    expect(await cache.get('a', async () => 'v3')).toBe('v2');
  });

  it('does not cache failed builds', async () => {
    const { cache } = createCache();

    await expect(
      cache.get('a', async () => {
        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');
    expect(await cache.get('a', async () => 'ok')).toBe('ok');
  });

  it('rejects builds once the queue is full', async () => {
    const { cache } = createCache();
    let release: () => void = () => undefined;
    const blocked = new Promise<string>((resolve) => {
      release = () => resolve('first');
    });

    const first = cache.get('a', () => blocked);
    const second = cache.get('b', async () => 'second');
    const third = cache.get('c', async () => 'third');

    await expect(third).rejects.toBeInstanceOf(SchemaCacheOverloadedError);
    release();
    expect(await first).toBe('first');
    expect(await second).toBe('second');
  });
});
