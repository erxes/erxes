import { useEffect, useLayoutEffect, useRef } from 'react';
import { z } from 'zod';

/**
 * How plugin UIs reach their own API and hear about changes. erxes-ui is a
 * Module Federation singleton, so every plugin UI gets the host's.
 *
 * - `pluginUrl('hr', '/api/v1/me')` is `/pl:hr/api/v1/me` on core's own
 *   address. Core forwards it to the plugin's API (its manifest's `api.url`)
 *   with a 5-minute token for this member and this plugin only, so the session
 *   cookie stays first-party and never reaches the plugin. Use it for links,
 *   images and downloads too.
 * - `pluginFetch('hr', '/api/v1/leaves')` is `fetch` on that address.
 * - `useLiveSignal('hr', ['leaves'], refetch)` runs when the plugin says a
 *   topic changed (`core_live_signal` / `POST /core/v1/plugins/live`), and
 *   after reconnecting, over the one stream the browser keeps with core. The
 *   host provides it with `setPluginRuntime`.
 */

export type PluginLiveMessage = { plugin: string; topics: string[] } | { resync: true };

export interface PluginRuntime {
  subscribe(listener: (message: PluginLiveMessage) => void): () => void;
}

let runtime: PluginRuntime | null = null;

export const setPluginRuntime = (next: PluginRuntime | null) => {
  runtime = next;
};

export const getPluginRuntime = () => runtime;

/** The address of `path` on a plugin's API, as the browser reaches it through core. */
export const pluginUrl = (plugin: string, path = '') => `/pl:${plugin}/${path.replace(/^\/+/, '')}`;

/** `fetch` against a plugin's API as the signed-in member. */
export const pluginFetch = (plugin: string, path: string, init: RequestInit = {}) =>
  fetch(pluginUrl(plugin, path), { ...init, credentials: 'same-origin' });

const errorBody = z.object({ message: z.string() });

/** JSON in, JSON out; non-2xx responses throw with the body's `message`. */
export const pluginJson = async <T>(
  plugin: string,
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<T> => {
  const { json, ...rest } = init;
  const headers = new Headers(rest.headers);

  if (json !== undefined) headers.set('Content-Type', 'application/json');

  const response = await pluginFetch(plugin, path, {
    ...rest,
    headers,
    body: json === undefined ? rest.body : JSON.stringify(json),
  });

  const text = await response.text();
  const body = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const parsed = errorBody.safeParse(body);

    const message = parsed.success
      ? parsed.data.message
      : `${response.status} ${response.statusText}`;

    throw Object.assign(new Error(message), { status: response.status, body });
  }

  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the caller names the response type (pluginJson<T>), the plugin contract; the plugin's own API defines the body
  return body as T;
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
