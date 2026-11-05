import { REACT_APP_API_URL } from 'erxes-ui';
import { Extension, ExtensionOperation } from './types';

type Envelope<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };

// The runtime isn't behind the gateway: the request failed or came back
// without the runtime's `{ ok, ... }` envelope (the gateway's 404 page).
export class ExtensionsUnavailableError extends Error {
  constructor() {
    super("Extensions aren't enabled on this deployment");
  }
}

const isEnvelope = <T>(body: unknown): body is Envelope<T> =>
  typeof body === 'object' && body !== null && 'ok' in body;

// A body makes it a POST sent as JSON: the runtime refuses any other content
// type on a cookie-authenticated write.
const request = async <T>(path: string, body?: unknown) => {
  const response = await fetch(`${REACT_APP_API_URL}/pl:extensions${path}`, {
    credentials: 'include',
    ...(body !== undefined && {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
  }).catch(() => {
    throw new ExtensionsUnavailableError();
  });
  const json: unknown = await response.json().catch(() => null);

  if (!isEnvelope<T>(json)) {
    throw new ExtensionsUnavailableError();
  }

  if (!json.ok) {
    throw new Error(json.error.message);
  }

  return json.data;
};

const enc = encodeURIComponent;

export const extensionsApi = {
  list: () => request<Extension[]>('/installed'),
  // Checked the way install checks them, so a bundle install would refuse
  // fails here first.
  operations: (operations: Record<string, string>) =>
    request<ExtensionOperation[]>('/operations', { operations }),
  install: (bundle: unknown) =>
    request<{ id: string; version: string; reactivated: boolean }>(
      '/install',
      bundle,
    ),
  rollback: (extId: string, version: string) =>
    request(`/rollback/${enc(extId)}`, { version }),
  disable: (extId: string) => request(`/disable/${enc(extId)}`, {}),
  enable: (extId: string) => request(`/enable/${enc(extId)}`, {}),
  uninstall: (extId: string, purge: boolean) =>
    request(`/uninstall/${enc(extId)}`, { purge }),
};
