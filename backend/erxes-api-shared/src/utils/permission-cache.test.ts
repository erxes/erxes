const store = new Map<string, string>();
const calls = { scans: 0 };
let onScan: (() => void) | undefined;

jest.mock('./redis', () => ({
  redis: {
    get: async (key: string) => store.get(key) ?? null,
    set: async (key: string, value: string, ...args: unknown[]) => {
      if (args.includes('NX') && store.has(key)) {
        return null;
      }

      store.set(key, value);
      return 'OK';
    },
    del: async (...keys: string[]) =>
      keys.filter((key) => store.delete(key)).length,
    unlink: async (...keys: string[]) =>
      keys.filter((key) => store.delete(key)).length,
    scan: async (_cursor: string, _match: string, pattern: string) => {
      calls.scans += 1;
      onScan?.();
      const prefix = pattern.replace('*', '');

      return ['0', [...store.keys()].filter((key) => key.startsWith(prefix))];
    },
    eval: async (
      _script: string,
      _keys: number,
      key: string,
      token: string,
    ) => {
      if (store.get(key) === token) {
        store.delete(key);
        return 1;
      }

      return 0;
    },
  },
}));

import { clearCachedPermissionMaps } from './permission-cache';

const LOCK = 'permissions:cached-maps:clearing';

describe('clearCachedPermissionMaps', () => {
  beforeEach(() => {
    store.clear();
    calls.scans = 0;
    onScan = undefined;
  });

  it('drops cached permission maps only, and releases its lock', async () => {
    store.set('user_actions_a', '{}');
    store.set('user_actions_b', '{}');
    store.set('erxesservice:config:core', '{}');

    await clearCachedPermissionMaps();

    expect([...store.keys()]).toEqual(['erxesservice:config:core']);
    expect(calls.scans).toBe(1);
  });

  it('leaves the scan to the caller already running one', async () => {
    store.set(LOCK, 'someone-else');
    store.set('user_actions_a', '{}');

    await clearCachedPermissionMaps();

    expect(calls.scans).toBe(0);
    expect(store.get('user_actions_a')).toBe('{}');
    expect(store.get('permissions:cached-maps:clear-again')).toBe('1');
    expect(store.get(LOCK)).toBe('someone-else');
  });

  it('goes round again when asked during its scan', async () => {
    store.set('user_actions_a', '{}');
    onScan = () => {
      if (calls.scans === 1) {
        store.set('permissions:cached-maps:clear-again', '1');
        store.set('user_actions_rebuilt', '{}');
      }
    };

    await clearCachedPermissionMaps();

    expect(calls.scans).toBe(2);
    expect(store.has('user_actions_rebuilt')).toBe(false);
    expect(store.has(LOCK)).toBe(false);
  });
});
