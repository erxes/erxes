import { atomFamily } from 'jotai-family';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import type { z } from 'zod';

/*
 * Everything the browser keeps goes through here: one atom per key, named
 * `erxes:<area>:<name>`, read through a zod schema. A value that is missing, malformed or
 * from an older shape reads as `initial`, from storage and from other tabs alike. Blocked
 * storage (a sandboxed frame) or full storage keeps the value for this page only.
 */

interface StoredOptions<T> {
  key: string;
  schema: z.ZodType<T>;
  initial: NoInfer<T>;
  /** sessionStorage: kept for this tab until it closes. */
  session?: boolean;
}

/** Reading the storage itself throws where it is blocked; then nothing is kept. */
const nothingKept = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

const browserStorage = (session?: boolean) => () => {
  try {
    return session ? window.sessionStorage : window.localStorage;
  } catch {
    return nothingKept;
  }
};

/** An atom kept in browser storage under `key`. */
export const stored = <T>({ key, schema, initial, session }: StoredOptions<T>) => {
  const json = createJSONStorage<T>(browserStorage(session));
  const subscribe = json.subscribe;

  const valid = (value: unknown) => {
    const parsed = schema.safeParse(value);

    return parsed.success ? parsed.data : initial;
  };

  return atomWithStorage(
    key,
    initial,
    {
      getItem: (name) => valid(json.getItem(name, initial)),
      setItem: (name, value) => {
        try {
          json.setItem(name, value);
        } catch {
          // Full storage: the value lasts for this page.
        }
      },
      removeItem: json.removeItem,
      subscribe:
        subscribe &&
        ((name, callback) => subscribe(name, (value) => callback(valid(value)), initial)),
    },
    { getOnInit: true },
  );
};

/** One stored atom per id (a table, a user, a list), under `<key>:<id>`. */
export const storedFamily = <T>({ key, ...options }: StoredOptions<T>) =>
  atomFamily((id: string) => stored({ key: `${key}:${id}`, ...options }));
