import { z } from 'zod';

export interface CredentialConsumerOptions {
  /** Defaults to PLATFORM_CREDENTIALS_URL. HTTPS except local development. */
  endpoint?: string;
  /** Defaults to PLATFORM_CREDENTIALS_TOKEN. A grant for this credential only. */
  token?: string;
  /** Defaults to PLATFORM_CREDENTIALS_REFERENCE. The immutable credential reference. */
  reference?: string;
  /** When provided, reject a credential of a different template. */
  templateId?: string;
}

const MAX_RESPONSE_BYTES = 256 * 1024;
const validFieldKey = (key: string): boolean =>
  typeof key === 'string' &&
  /^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(key) &&
  !['__proto__', 'constructor', 'prototype'].includes(key);

const responseSchema = z.object({
  reference: z.string(),
  templateId: z.string().min(1).max(64),
  values: z.record(z.string().max(16384)).refine((values) => {
    const keys = Object.keys(values);
    return keys.length <= 32 && keys.every(validFieldKey);
  }),
});

const unavailable = (): Error => new Error('Credential unavailable');

const readPayload = async (response: Response): Promise<unknown> => {
  const reader = response.body?.getReader();
  if (!reader) throw unavailable();
  try {
    const contentLength = Number(response.headers.get('content-length'));
    if (contentLength > MAX_RESPONSE_BYTES) throw unavailable();

    const decoder = new TextDecoder('utf-8', { fatal: true });
    let bytes = 0;
    let text = '';
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > MAX_RESPONSE_BYTES) throw unavailable();
      text += decoder.decode(chunk.value, { stream: true });
    }
    return JSON.parse(text + decoder.decode());
  } catch {
    await reader.cancel().catch(() => undefined);
    throw unavailable();
  } finally {
    reader.releaseLock();
  }
};

/**
 * Server-only, grant-scoped read. Never caches values or falls back to existing
 * integrations. Errors deliberately omit tokens, payloads and original causes.
 */
export const getCredentialValues = async (
  options: CredentialConsumerOptions = {},
): Promise<Record<string, string>> => {
  if (typeof window !== 'undefined') {
    throw new Error('Credential helpers are server-only');
  }

  const endpoint = options.endpoint ?? process.env.PLATFORM_CREDENTIALS_URL;
  const token = options.token ?? process.env.PLATFORM_CREDENTIALS_TOKEN;
  const reference =
    options.reference ?? process.env.PLATFORM_CREDENTIALS_REFERENCE;
  if (!endpoint || !token || !reference) {
    throw new Error('Credential consumer is not configured');
  }

  try {
    const base = new URL(endpoint);
    const localDevelopment =
      process.env.NODE_ENV !== 'production' &&
      base.protocol === 'http:' &&
      ['localhost', '127.0.0.1', '[::1]'].includes(base.hostname);
    if (
      (base.protocol !== 'https:' && !localDevelopment) ||
      base.username ||
      base.password ||
      base.search ||
      base.hash ||
      base.pathname !== '/' ||
      !/^cred_[0-9a-f-]{36}$/.test(reference) ||
      token.length > 1024 ||
      /\s/.test(token)
    ) {
      throw unavailable();
    }

    const response = await fetch(new URL('/credentials/consume', base), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reference }),
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(5000),
    });
    if (
      !response.ok ||
      response.headers
        .get('content-type')
        ?.split(';')[0]
        .trim()
        .toLowerCase() !== 'application/json'
    ) {
      await response.body?.cancel().catch(() => undefined);
      throw unavailable();
    }

    const parsed = responseSchema.safeParse(await readPayload(response));
    if (
      !parsed.success ||
      parsed.data.reference !== reference ||
      (options.templateId !== undefined &&
        parsed.data.templateId !== options.templateId)
    ) {
      throw unavailable();
    }
    return parsed.data.values;
  } catch {
    throw unavailable();
  }
};

/** Read one field using the configured credential or an explicit instance. */
export const getCredentialValue = async (
  key: string,
  options: CredentialConsumerOptions = {},
): Promise<string> => {
  if (!validFieldKey(key)) throw unavailable();
  const values = await getCredentialValues(options);
  if (!Object.prototype.hasOwnProperty.call(values, key)) throw unavailable();
  return values[key];
};
