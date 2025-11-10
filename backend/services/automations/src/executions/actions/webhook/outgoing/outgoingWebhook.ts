import {
  OutgoingAuthConfig,
  OutgoingRetryOptions,
  TOutgoinWebhookActionConfig,
} from '@/types';
import {
  IAutomationAction,
  splitType,
  TAutomationProducers,
} from 'erxes-api-shared/core-modules';
import { sendCoreModuleProducer } from 'erxes-api-shared/utils';
import {
  applyBackoff,
  attachAuth,
  buildQuery,
  generateFetchAgent,
  toHeadersObject,
} from './utils';
import { outgoingWebhookDoFetch } from './outgoingWebhookDoFetch';

export async function executeOutgoingWebhook({
  subdomain,
  targetType,
  target,
  action,
}: {
  subdomain: string;
  targetType: string;
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
    body = '{}',
    auth,
    headers = [],
    options = {},
  } = action?.config || {};

  if (!url) {
    throw new Error('Outgoing webhook url is required');
  }
  const [pluginName, moduleName] = splitType(targetType);

  const timeoutMs = options.timeout ?? 10000;
  const ignoreSSL = options.ignoreSSL ?? false;
  const followRedirect = options.followRedirect ?? false;
  const maxRedirects = options.maxRedirects ?? 5;
  const retryOpts: OutgoingRetryOptions = {
    attempts: options.retry?.attempts ?? 0,
    delay: options.retry?.delay ?? 1000,
    backoff: options.retry?.backoff ?? 'none',
  };

  const replacedHeaders = await sendCoreModuleProducer({
    moduleName: 'automations',
    subdomain,
    pluginName,
    producerName: TAutomationProducers.REPLACE_PLACEHOLDERS,
    input: {
      moduleName,
      target: { ...target, type: targetType },
      config: toHeadersObject(headers),
    },
    defaultValue: {},
  });

  const replacedBody = await sendCoreModuleProducer({
    moduleName: 'automations',
    subdomain,
    pluginName,
    producerName: TAutomationProducers.REPLACE_PLACEHOLDERS,
    input: {
      moduleName,
      target: { ...target, type: targetType },
      config: body ? JSON.parse(body) : {},
    },
    defaultValue: {},
  });
  // Build URL with query params (evaluate expressions via worker)
  const replacedQueryParamsObject = await sendCoreModuleProducer({
    moduleName: 'automations',
    subdomain,
    pluginName,
    producerName: TAutomationProducers.REPLACE_PLACEHOLDERS,
    input: {
      moduleName,
      target: { ...target, type: targetType },
      config: queryParams.reduce((acc, cur) => {
        acc[cur.name] = cur.value;
        return acc;
      }, {}),
    },
    defaultValue: {},
  });
  const queryParamsList: { name: string; value: string }[] = Object.entries(
    replacedQueryParamsObject,
  ).map(([k, v]) => ({ name: k, value: String(v ?? '') }));
  let currentUrl = new URL(url);
  const query = buildQuery(queryParamsList);
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
  let agent = generateFetchAgent(options, ignoreSSL);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let lastErr: any;
  const attempts = Math.max(0, retryOpts.attempts || 0) + 1;
  for (let i = 1; i <= attempts; i++) {
    try {
      const res = await outgoingWebhookDoFetch({
        currentUrl,
        method,
        headersObj,
        requestBody,
        followRedirect,
        maxRedirects,
        agent,
        controller,
      });
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
