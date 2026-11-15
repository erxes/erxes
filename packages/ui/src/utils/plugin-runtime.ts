import { useEffect, useLayoutEffect, useRef } from 'react';
import { z } from 'zod';
import { jsonOf } from './json';

/**
 * How plugin UIs reach their own API and hear about changes. The host app
 * (web) provides the runtime; erxes-ui is a Module Federation singleton,
 * so every plugin UI gets the host's.
 *
 * - `pluginFetch('hr', '/leaves')` calls the plugin's API (its address comes
 *   from the plugin's manifest) with a 5-minute token core issues for this
 *   member and this plugin only. The plugin verifies it with core's public
 *   keys; core's session cookie never leaves core.
 * - `useLiveSignal('hr', ['leaves'], refetch)` runs when the plugin says a
 *   topic changed (`core_live_signal` / `POST /core/v1/plugins/live`), and
 *   after reconnecting, over the one stream the browser keeps with core.
 */

export interface PluginSession {
  token: string;
  /** ISO time the token stops working. */
  expiresAt: string;
  /** The plugin API's address, from its manifest. */
  apiUrl: string | null;
}

export type PluginLiveMessage = { plugin: string; topics: string[] } | { resync: true };

export interface PluginRuntime {
  session(plugin: string): Promise<PluginSession>;
  subscribe(listener: (message: PluginLiveMessage) => void): () => void;
}

/** A session and when it ends on this browser's clock. */
interface Held {
  session: PluginSession;
  endsAt: number;
}

let runtime: PluginRuntime | null = null;
const sessions = new Map<string, Promise<Held>>();

/** A token is replaced this long before it ends, so no call carries one about to expire. */
const RENEW_BEFORE_MS = 30_000;

export const setPluginRuntime = (next: PluginRuntime | null) => {
  runtime = next;
  sessions.clear();
};

export const getPluginRuntime = () => runtime;

const need = () => {
  if (!runtime)
    throw new Error('erxes plugin runtime is not available (open the plugin inside erxes)');

  return runtime;
};

const Lifetime = jsonOf(z.object({ iat: z.number(), exp: z.number() }));

/** A JWT's claims as text; '' for a token that isn't one (its lifetime then comes from `expiresAt`). */
const claimsText = (token: string) => {
  try {
    return atob((token.split('.')[1] ?? '').replaceAll('-', '+').replaceAll('_', '/'));
  } catch {
    return '';
  }
};

/**
 * How long a token lasts, from its own claims (both core's clock), so a
 * browser whose clock is set wrong still renews on time.
 */
const lifetimeMs = (session: PluginSession) => {
  const claims = Lifetime.safeParse(claimsText(session.token));

  return claims.success
    ? (claims.data.exp - claims.data.iat) * 1000
    : new Date(session.expiresAt).getTime() - Date.now();
};

const renew = (plugin: string) => {
  const request = need()
    .session(plugin)
    .then((session) => ({ session, endsAt: Date.now() + lifetimeMs(session) }));

  sessions.set(plugin, request);
  request.catch(() => {
    if (sessions.get(plugin) === request) sessions.delete(plugin);
  });

  return request;
};

/**
 * This member's session for `plugin`, renewed 30 seconds before it ends.
 * `refused` is a token the plugin just turned down: it is replaced once, for
 * every call that failed with it at the same time.
 */
const sessionOf = async (plugin: string, refused?: string): Promise<PluginSession> => {
  const cached = sessions.get(plugin);

  if (cached) {
    const held = await cached.catch(() => null);

    if (held && held.session.token !== refused && held.endsAt - Date.now() > RENEW_BEFORE_MS) {
      return held.session;
    }

    // Another call is renewing it already.
    const renewing = sessions.get(plugin);

    if (renewing && renewing !== cached) return (await renewing).session;
  }

  return (await renew(plugin)).session;
};

const join = (base: string, path: string) =>
  `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;

/**
 * `fetch` against a plugin's API as the signed-in member. Relative paths are
 * resolved against the plugin's API address; a 401 renews the token once and
 * sends the call again, so `init.body` must be one that can be sent twice
 * (text, an ArrayBuffer, a Blob or FormData, not a stream).
 */
export const pluginFetch = async (
  plugin: string,
  path: string,
  init: RequestInit = {},
): Promise<Response> => {
  const send = async (session: PluginSession) => {
    const headers = new Headers(init.headers);

    headers.set('Authorization', `Bearer ${session.token}`);

    const url = /^https?:\/\//.test(path) ? path : join(session.apiUrl ?? `/pl/${plugin}`, path);

    return fetch(url, { ...init, headers, credentials: 'omit' });
  };

  const session = await sessionOf(plugin);
  const response = await send(session);

  return response.status === 401 ? send(await sessionOf(plugin, session.token)) : response;
};

const errorBody = z.object({ message: z.string() });

/**
 * JSON in, JSON out, checked against `schema`. Non-2xx responses throw with the
 * body's `message`; a 2xx body that isn't JSON of that shape throws a ZodError.
 */
export const pluginJson = async <S extends z.ZodType>(
  plugin: string,
  path: string,
  schema: S,
  init: RequestInit & { json?: unknown } = {},
) => {
  const { json, ...rest } = init;
  const headers = new Headers(rest.headers);

  if (json !== undefined) headers.set('Content-Type', 'application/json');

  const response = await pluginFetch(plugin, path, {
    ...rest,
    headers,
    body: json === undefined ? rest.body : JSON.stringify(json),
  });

  const text = await response.text();

  if (!response.ok) {
    const message =
      jsonOf(errorBody).safeParse(text).data?.message ??
      `${response.status} ${response.statusText}`;

    throw Object.assign(new Error(message), { status: response.status, body: text });
  }

  return jsonOf(schema).parse(text || 'null');
};

/**
 * Runs `onSignal(topics)` when the plugin announces a change to any of
 * `topics` — and after a reconnect (with every topic), since signals sent
 * meanwhile were missed.
 */
export const useLiveSignal = (
  plugin: string,
  topics: string | string[],
  onSignal: (topics: string[]) => void,
) => {
  const handler = useRef(onSignal);
  const list = Array.isArray(topics) ? topics : [topics];
  const key = list.join('\n');

  useLayoutEffect(() => {
    handler.current = onSignal;
  });

  useEffect(() => {
    if (!runtime) return undefined;

    const wanted = new Set(key.split('\n'));

    return runtime.subscribe((message) => {
      if ('resync' in message) {
        handler.current([...wanted]);

        return;
      }

      if (message.plugin !== plugin) return;

      const matched = message.topics.filter((topic) => wanted.has(topic));

      if (matched.length) handler.current(matched);
    });
  }, [plugin, key]);
};
