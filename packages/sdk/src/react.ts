import { useCallback, useEffect, useState } from 'react';
import type * as z from 'zod';
import { type ErrorBody, ExtensionError } from './errors';
import type { ExtensionFunction, FunctionKind } from './server';

export { ExtensionError } from './errors';

// A pointer to one extension function. Carries its types, not its code: the
// UI imports the server only as a type.
export type FunctionRef<K extends FunctionKind, I, R> = {
  readonly apiUrl: string;
  readonly extId: string;
  readonly path: string;
  readonly __types?: { kind: K; input: I; output: R };
};

type Namespace<T> = {
  [F in keyof T as T[F] extends ExtensionFunction
    ? F
    : never]: T[F] extends ExtensionFunction<infer K, infer I, infer R>
    ? FunctionRef<K, z.input<I>, R>
    : never;
};

// `typeof import('../server')` turned into refs: api.agents.list, api.agents.add.
export type Api<M> = {
  [N in keyof M as M[N] extends ExtensionFunction
    ? never
    : M[N] extends Record<string, unknown>
    ? N
    : never]: Namespace<M[N]>;
};

export const createApi = <M>({
  apiUrl,
  extId,
}: {
  apiUrl: string;
  extId: string;
}) =>
  new Proxy(
    {},
    {
      get: (_, ns: string) =>
        new Proxy(
          {},
          { get: (__, fn: string) => ({ apiUrl, extId, path: `${ns}.${fn}` }) },
        ),
    },
  ) as Api<M>;

// Runs as the signed-in user: the session cookie goes along. Fails with an
// ExtensionError carrying the server's code, message and field issues.
export const call = async <K extends FunctionKind, I, R>(
  ref: FunctionRef<K, I, R>,
  input: I,
): Promise<R> => {
  const res = await fetch(
    `${ref.apiUrl}/pl:extensions/call/${ref.extId}/${ref.path}`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input ?? {}),
    },
  );
  const body = (await res.json().catch(() => null)) as
    | { ok: true; data: R }
    | { ok: false; error: ErrorBody }
    | null;

  if (!body) {
    throw new ExtensionError('HTTP_ERROR', `Request failed with ${res.status}`);
  }

  if (!body.ok) {
    const { code, message, issues } = body.error;
    throw new ExtensionError(code, message, issues);
  }

  return body.data;
};

// Live queries per extension. A mutation refetches every one of them, which
// is simple and right for an extension's handful of screens.
const listeners = new Map<string, Set<() => void>>();

const invalidate = (extId: string) =>
  listeners.get(extId)?.forEach((refetch) => refetch());

const errorText = (e: unknown) =>
  e instanceof Error ? e.message : 'Something went wrong';

// Keeps the last result on screen while the next one loads.
export const useQuery = <I, R>(ref: FunctionRef<'query', I, R>, input: I) => {
  const { apiUrl, extId, path } = ref;
  const key = JSON.stringify(input ?? {});
  const [data, setData] = useState<R>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const refetch = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    const set = listeners.get(extId) ?? new Set();
    listeners.set(extId, set.add(refetch));
    return () => void set.delete(refetch);
  }, [extId, refetch]);

  useEffect(() => {
    let current = true;
    setLoading(true);

    call<'query', I, R>({ apiUrl, extId, path }, JSON.parse(key))
      .then((result) => {
        if (!current) return;
        setData(result);
        setError(null);
      })
      .catch((e: unknown) => {
        if (current) setError(errorText(e));
      })
      .finally(() => {
        if (current) setLoading(false);
      });

    return () => {
      current = false;
    };
  }, [apiUrl, extId, path, key, version]);

  return { data, error, loading, refetch };
};

export const useMutation = <I, R>(ref: FunctionRef<'mutation', I, R>) => {
  const { apiUrl, extId, path } = ref;
  const [pending, setPending] = useState(false);

  const mutate = useCallback(
    async (input: I) => {
      setPending(true);
      try {
        const result = await call<'mutation', I, R>(
          { apiUrl, extId, path },
          input,
        );
        invalidate(extId);
        return result;
      } finally {
        setPending(false);
      }
    },
    [apiUrl, extId, path],
  );

  return { mutate, pending };
};

// Types of a ref, for props and helpers: InputOf<typeof api.agents.add>.
export type InputOf<F> = F extends FunctionRef<FunctionKind, infer I, unknown>
  ? I
  : never;
export type OutputOf<F> = F extends FunctionRef<FunctionKind, unknown, infer R>
  ? R
  : never;

// Adds the extension's own CSS (built by ext-css: only what the host lacks)
// once, when its UI config loads.
export const injectStyles = (extId: string, css: string) => {
  if (document.querySelector(`style[data-extension="${extId}"]`)) {
    return;
  }

  const style = document.createElement('style');
  style.dataset.extension = extId;
  style.textContent = css;
  document.head.append(style);
};
