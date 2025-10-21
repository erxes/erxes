import {
  OutgoingAuthConfig,
  OutgoingHeaderItem,
  OutgoingRetryOptions,
  TOutgoinWebhookActionConfig,
} from '@/types';
import {
  IAutomationAction,
  splitType,
  TAutomationProducers,
} from 'erxes-api-shared/core-modules';
import { sendCoreModuleProducer } from 'erxes-api-shared/utils';
import * as https from 'https';
import { HttpsProxyAgent } from 'https-proxy-agent';
import jwt from 'jsonwebtoken';

type ReplaceResult<T> = T;

async function replacePlaceholders<T extends Record<string, any>>(
  subdomain: string,
  triggerType: string,
  target: any,
  payload: T,
): Promise<ReplaceResult<T>> {
  const [pluginName] = splitType(triggerType);
  const result = await sendCoreModuleProducer({
    moduleName: 'automations',
    pluginName,
    producerName: TAutomationProducers.REPLACE_PLACEHOLDERS,
    input: {
      target: { ...target, type: triggerType },
      config: payload,
    },
    defaultValue: payload,
  });
  return (result || payload) as ReplaceResult<T>;
}

function buildQuery(queryParams: { name: string; value: string }[]): string {
  const urlParams = new URLSearchParams();
  for (const { name, value } of queryParams) {
    if (!name) continue;
    urlParams.append(name, value ?? '');
  }
  const query = urlParams.toString();
  return query ? `?${query}` : '';
}

function applyBackoff(
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

function toHeadersObject(items: OutgoingHeaderItem[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const { key, value } of items) {
    if (!key) continue;
    out[key] = value ?? '';
  }
  return out;
}

function attachAuth(
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

export async function executeOutgoingWebhook({
  subdomain,
  triggerType,
  target,
  action,
}: {
  subdomain: string;
  triggerType: string;
  target: any;
  action: IAutomationAction<TOutgoinWebhookActionConfig>;
}): Promise<{
  status: number;
  ok: boolean;
  headers: Record<string, string>;
  bodyText: string;
}> {
  const {
    method = 'POST',
    url,
    queryParams = [],
    body = {},
    auth,
    headers = [],
    options = {},
  } = action?.config || {};

  if (!url) throw new Error('Outgoing webhook url is required');

  const timeoutMs = options.timeout ?? 10000;
  const ignoreSSL = options.ignoreSSL ?? false;
  const followRedirect = options.followRedirect ?? false;
  const maxRedirects = options.maxRedirects ?? 5;
  const retryOpts: OutgoingRetryOptions = {
    attempts: options.retry?.attempts ?? 0,
    delay: options.retry?.delay ?? 1000,
    backoff: options.retry?.backoff ?? 'none',
  };

  const replacedHeaders = await replacePlaceholders<
    Record<string, string | number | boolean>
  >(
    subdomain,
    triggerType,
    target,
    toHeadersObject(
      (await replacePlaceholders<Record<string, string | number | boolean>>(
        subdomain,
        triggerType,
        target,
        headers.reduce((acc, h) => {
          acc[h.key] = h.value;
          return acc;
        }, {} as Record<string, string>),
      )) as any,
    ) as any,
  );

  const replacedBody = await replacePlaceholders(
    subdomain,
    triggerType,
    target,
    body || {},
  );

  // Build URL with query params (evaluate expressions via worker)
  const qpPairs = queryParams.map((q) => ({ name: q.name, value: q.value }));
  const replacedQpObj = await replacePlaceholders(
    subdomain,
    triggerType,
    target,
    qpPairs.reduce((acc, cur) => {
      acc[cur.name] = cur.value;
      return acc;
    }, {} as Record<string, string>),
  );
  const qpList: { name: string; value: string }[] = Object.entries(
    replacedQpObj,
  ).map(([k, v]) => ({ name: k, value: String(v ?? '') }));

  let currentUrl = new URL(url);
  const query = buildQuery(qpList);
  if (query) {
    currentUrl = new URL(currentUrl.toString() + query);
  }

  let headersObj: Record<string, string> = {};
  for (const [k, v] of Object.entries(replacedHeaders || {})) {
    headersObj[k] = String(v);
  }
  if (!headersObj['Content-Type'] && method !== 'GET' && method !== 'HEAD') {
    headersObj['Content-Type'] = 'application/json';
  }

  let requestBody: any = replacedBody;
  if (
    headersObj['Content-Type']?.includes('application/json') &&
    requestBody &&
    typeof requestBody !== 'string'
  ) {
    requestBody = JSON.stringify(requestBody);
  }

  // Attach auth (basic/bearer/jwt)
  const authApplied = attachAuth(
    headersObj,
    currentUrl,
    requestBody,
    auth as OutgoingAuthConfig | undefined,
  );
  headersObj = authApplied.headers;
  currentUrl = authApplied.url;
  requestBody = authApplied.body;

  // Build agent (proxy / ignoreSSL)
  let agent: any | undefined;
  if (options.proxy?.host && options.proxy?.port) {
    try {
      const authStr = options.proxy.auth?.username
        ? `${encodeURIComponent(
            options.proxy.auth.username,
          )}:${encodeURIComponent(options.proxy.auth.password || '')}@`
        : '';
      const proxyUrl = `http://${authStr}${options.proxy.host}:${options.proxy.port}`;
      agent = new HttpsProxyAgent(proxyUrl);
    } catch {
      // Fallback: ignore proxy if module is unavailable
    }
  } else if (ignoreSSL) {
    agent = new https.Agent({ rejectUnauthorized: false });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const doFetch = async (): Promise<Response> => {
    const res = await fetch(currentUrl.toString(), {
      method,
      headers: headersObj,
      body: method === 'GET' || method === 'HEAD' ? undefined : requestBody,
      redirect: followRedirect ? 'follow' : 'manual',
      // @ts-ignore
      agent,
      signal: controller.signal,
    } as any);

    // Manual redirect handling when follow disabled but maxRedirects > 0
    let redirects = 0;
    let response = res;
    while (
      !followRedirect &&
      response.status >= 300 &&
      response.status < 400 &&
      redirects < maxRedirects
    ) {
      const loc = response.headers.get('location');
      if (!loc) break;
      currentUrl = new URL(loc, currentUrl);
      response = await fetch(currentUrl.toString(), {
        method,
        headers: headersObj,
        body: method === 'GET' || method === 'HEAD' ? undefined : requestBody,
        // @ts-ignore
        agent,
        signal: controller.signal,
      });
      redirects += 1;
    }

    return response;
  };

  let lastErr: any;
  const attempts = Math.max(0, retryOpts.attempts || 0) + 1;
  for (let i = 1; i <= attempts; i++) {
    try {
      const res = await doFetch();
      const bodyText = await res.text();
      const resultHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => (resultHeaders[k] = v));
      clearTimeout(timer);
      return {
        status: res.status,
        ok: res.ok,
        headers: resultHeaders,
        bodyText,
      };
    } catch (e) {
      lastErr = e;
      if (i === attempts) break;
      const delay = applyBackoff(
        retryOpts.delay || 1000,
        retryOpts.backoff || 'none',
        i,
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  clearTimeout(timer);
  throw lastErr instanceof Error
    ? lastErr
    : new Error('Outgoing webhook failed');
}
