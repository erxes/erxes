import { HttpsProxyAgent } from 'https-proxy-agent';
import { OutgoingRetryOptions, TOutgoinWebhookActionConfig } from '@/types';
import * as https from 'https';
import { OutgoingHeaderItem } from '@/types';
import { OutgoingAuthConfig } from '@/types';
import jwt from 'jsonwebtoken';

export const generateFetchAgent = (
  options: TOutgoinWebhookActionConfig['options'],
  ignoreSSL: boolean,
) => {
  const { proxy } = options || {};
  let agent: any | undefined;
  if (proxy?.host && proxy?.port) {
    try {
      const authStr = proxy.auth?.username
        ? `${encodeURIComponent(proxy.auth.username)}:${encodeURIComponent(
            proxy.auth.password || '',
          )}@`
        : '';
      const proxyUrl = `http://${authStr}${proxy.host}:${proxy.port}`;
      agent = new HttpsProxyAgent(proxyUrl);
    } catch {
      // Fallback: ignore proxy if module is unavailable
    }
  } else if (ignoreSSL) {
    agent = new https.Agent({ rejectUnauthorized: false });
  }

  return agent;
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
  body: any,
  auth?: OutgoingAuthConfig,
): { headers: Record<string, string>; url: URL; body: any } {
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
    const signOpts: any = {};
    if (auth.expiresIn) signOpts.expiresIn = auth.expiresIn;
    if (auth.audience) signOpts.audience = auth.audience;
    if (auth.issuer) signOpts.issuer = auth.issuer;
    if (auth.header) signOpts.header = auth.header as any;

    const token = jwt.sign(claims, auth.secretKey, {
      ...signOpts,
      algorithm: (auth.algorithm as any) || 'HS256',
    });

    const placement = auth.placement || 'header';
    if (placement === 'header') {
      headers['Authorization'] = `Bearer ${token}`;
    } else if (placement === 'query') {
      url.searchParams.set('access_token', token);
    } else if (placement === 'body' && body && typeof body === 'object') {
      body.access_token = token;
    }
    return { headers, url, body };
  }

  return { headers, url, body };
}
