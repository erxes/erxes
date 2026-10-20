import { REACT_APP_API_URL } from 'erxes-ui';
import {
  Extension,
  ExtensionContract,
  ExtensionRun,
  ExtensionSecret,
} from './types';

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

// A body makes it a write, sent as JSON: the runtime refuses any other
// content type on a cookie-authenticated write.
const request = async <T>(
  path: string,
  body?: unknown,
  method: 'POST' | 'PUT' | 'DELETE' = 'POST',
) => {
  const response = await fetch(`${REACT_APP_API_URL}/pl:extensions${path}`, {
    credentials: 'include',
    ...(body !== undefined && {
      method,
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

// Where a vendor sends one of the install's webhooks. Public: the signature
// is the only credential.
export const webhookUrl = (installKey: string, name: string) =>
  `${REACT_APP_API_URL}/pl:extensions/webhooks/${enc(installKey)}/${enc(name)}`;

export const extensionsApi = {
  list: () => request<Extension[]>('/installed'),
  contracts: () => request<ExtensionContract[]>('/contracts'),
  runs: (extId: string) => request<ExtensionRun[]>(`/runs/${enc(extId)}`),
  install: (bundle: unknown) =>
    request<{ id: string; version: string }>('/install', bundle),
  rollback: (extId: string, version: string) =>
    request(`/rollback/${enc(extId)}`, { version }),
  disable: (extId: string) => request(`/disable/${enc(extId)}`, {}),
  enable: (extId: string) => request(`/enable/${enc(extId)}`, {}),
  uninstall: (extId: string, purge: boolean) =>
    request(`/uninstall/${enc(extId)}`, { purge }),
  secrets: (extId: string) =>
    request<ExtensionSecret[]>(`/secrets/${enc(extId)}`),
  setSecret: (extId: string, name: string, value: string) =>
    request(`/secrets/${enc(extId)}/${enc(name)}`, { value }, 'PUT'),
  clearSecret: (extId: string, name: string) =>
    request(`/secrets/${enc(extId)}/${enc(name)}`, {}, 'DELETE'),
};
