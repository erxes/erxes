import {
  OutgoingAuthConfig,
  OutgoingHeaderItem,
  OutgoingRetryOptions,
  TOutgoinWebhookActionConfig,
} from '../../../../types';
import { HttpsProxyAgent } from 'https-proxy-agent';
import jwt, { Algorithm, JwtHeader, SignOptions } from 'jsonwebtoken';

/**
 * Build an HTTP(S) agent for an outgoing webhook request.
 *
 * Only an HTTPS proxy agent is ever returned. TLS certificate validation is
 * always enforced — there is intentionally no opt-out, to prevent
 * man-in-the-middle attacks (CWE-295/297).
 *
 * Proxy behavior is fail-closed: if a proxy is configured but the agent
 * cannot be constructed (typically because of a malformed proxy URL or
 * invalid host/port), the function throws a descriptive `Error` so the
 * webhook run surfaces the configuration problem instead of silently
 * bypassing the configured egress path.
 *
 * @param options - The outgoing webhook `options` block from the action config.
 * @returns A configured {@link HttpsProxyAgent} when a proxy is specified, or
 *          `undefined` to use the default global agent (direct connection).
 * @throws Error if a proxy is configured but cannot be constructed.
 */
export const generateFetchAgent = (
  options: TOutgoinWebhookActionConfig['options'],
): HttpsProxyAgent<string> | undefined => {
  const { proxy } = options || {};

  if (!proxy?.host || !proxy?.port) {
    return undefined;
  }

  try {
    const authStr = proxy.auth?.username
      ? `${encodeURIComponent(proxy.auth.username)}:${encodeURIComponent(
          proxy.auth.password || '',
        )}@`
      : '';
    const proxyUrl = `http://${authStr}${proxy.host}:${proxy.port}`;
    return new HttpsProxyAgent(proxyUrl);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Outgoing webhook proxy configuration is invalid (host=${proxy.host}, port=${proxy.port}): ${message}`,
    );
  }
};

export function buildQuery(
  queryParams: { name: string; value: string }[],
): string {
  const urlParams = new URLSearchParams();
  for (const { name, value } of queryParams) {
    if (!name) continue;
    urlParams.append(name, value ?? '');
  }
  const query = urlParams.toString();
  return query ? `?${query}` : '';
}

export function applyBackoff(
  baseDelay: number,
  backoff: OutgoingRetryOptions['backoff'],
  attempt: number,
): number {
  if (backoff === 'exponential') return baseDelay * Math.pow(2, attempt - 1);
  if (backoff === 'jitter') {
    const exp = baseDelay * Math.pow(2, attempt - 1);
    return Math.floor(Math.random() * exp);
  }
  return baseDelay;
}

export function toHeadersObject(
  items: OutgoingHeaderItem[],
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const { key, value } of items) {
    if (!key) continue;
    out[key] = value ?? '';
  }
  return out;
}

export function attachAuth(
  headers: Record<string, string>,
  url: URL,
  body: unknown,
  auth?: OutgoingAuthConfig,
): { headers: Record<string, string>; url: URL; body: unknown } {
  if (!auth || auth.type === 'none') return { headers, url, body };

  if (auth.type === 'basic') {
    const token = Buffer.from(`${auth.username}:${auth.password}`).toString(
      'base64',
    );
    headers['Authorization'] = `Basic ${token}`;
    return { headers, url, body };
  }

  if (auth.type === 'bearer') {
    headers['Authorization'] = `Bearer ${auth.token}`;
    return { headers, url, body };
  }

  if (auth.type === 'jwt') {
    const claims = auth.claims || {};
    const signOpts: SignOptions = {};
    if (auth.expiresIn) {
      signOpts.expiresIn = auth.expiresIn as SignOptions['expiresIn'];
    }
    if (auth.audience) signOpts.audience = auth.audience;
    if (auth.issuer) signOpts.issuer = auth.issuer;
    if (auth.header) signOpts.header = auth.header as unknown as JwtHeader;

    const token = jwt.sign(claims, auth.secretKey, {
      ...signOpts,
      algorithm: (auth.algorithm as Algorithm) || 'HS256',
    });

    const placement = auth.placement || 'header';
    if (placement === 'header') {
      headers['Authorization'] = `Bearer ${token}`;
    } else if (placement === 'query') {
      url.searchParams.set('access_token', token);
    } else if (
      placement === 'body' &&
      body &&
      typeof body === 'object' &&
      !Array.isArray(body)
    ) {
      (body as Record<string, unknown>).access_token = token;
    }
    return { headers, url, body };
  }

  return { headers, url, body };
}
