import {
  OutgoingAuthConfig,
  OutgoingRetryOptions,
  TOutgoinWebhookActionConfig,
} from '../../../../types';
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

const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);

type TOutgoingWebhookResult = {
  status?: number;
  ok?: boolean;
  headers?: Record<string, string>;
  bodyText?: string;
  request: {
    method: string;
    url: string;
    headers: Record<string, string>;
    bodyText?: string;
  };
  response?: {
    status: number;
    statusText: string;
    ok: boolean;
    headers: Record<string, string>;
    contentType?: string;
    bodyText?: string;
    bodyJson?: unknown;
  };
  meta: {
    attemptCount: number;
  };
  error?: {
    phase: 'build' | 'network' | 'timeout' | 'response-parse';
    message: string;
    attemptCount: number;
  };
};

const parseWebhookResponseJson = (bodyText: string, contentType?: string) => {
  if (!bodyText || !contentType?.toLowerCase().includes('json')) {
    return undefined;
  }

  try {
    return JSON.parse(bodyText);
  } catch {
    return undefined;
  }
};

const sanitizeOutgoingWebhookErrorMessage = (message: string) => {
  const normalized = message.trim().split('\n')[0] || 'Outgoing webhook failed';
  const lowered = normalized.toLowerCase();
  const hasPotentialUrlCredentials =
    normalized.includes('://') &&
    normalized.includes('@') &&
    normalized.indexOf('://') < normalized.indexOf('@');
  const containsSensitiveMarker =
    lowered.includes('authorization') ||
    lowered.includes('bearer ') ||
    lowered.includes('api key') ||
    lowered.includes('api_key') ||
    lowered.includes('api-key') ||
    lowered.includes('token=') ||
    lowered.includes('secret=') ||
    lowered.includes('password=');

  if (hasPotentialUrlCredentials || containsSensitiveMarker) {
    return 'Outgoing webhook failed. Sensitive error details were hidden.';
  }

  return normalized.length > 500
    ? `${normalized.slice(0, 497)}...`
    : normalized;
};

const createOutgoingWebhookResult = ({
  method,
  url,
  requestHeaders,
  requestBodyText,
  attemptCount,
  response,
  bodyText,
}: {
  method: string;
  url: string;
  requestHeaders: Record<string, string>;
  requestBodyText?: string;
  attemptCount: number;
  response: Response;
  bodyText: string;
}): TOutgoingWebhookResult => {
  const responseHeaders: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value;
  });

  const contentType = response.headers.get('content-type') || undefined;
  const bodyJson = parseWebhookResponseJson(bodyText, contentType);

  return {
    // Keep these for compatibility with older webhook result consumers.
    status: response.status,
    ok: response.ok,
    headers: responseHeaders,
    bodyText,
    request: {
      method,
      url,
      headers: requestHeaders,
      bodyText: requestBodyText,
    },
    response: {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: responseHeaders,
      contentType,
      bodyText,
      bodyJson,
    },
    meta: {
      attemptCount,
    },
  };
};

const createOutgoingWebhookError = ({
  phase,
  message,
  method,
  url,
  requestHeaders,
  requestBodyText,
  attemptCount,
}: {
  phase: 'build' | 'network' | 'timeout' | 'response-parse';
  message: string;
  method: string;
  url: string;
  requestHeaders: Record<string, string>;
  requestBodyText?: string;
  attemptCount: number;
}) => {
  const safeMessage = sanitizeOutgoingWebhookErrorMessage(message);
  const error = new Error(safeMessage) as Error & {
    result?: TOutgoingWebhookResult;
  };

  error.result = {
    request: {
      method,
      url,
      headers: requestHeaders,
      bodyText: requestBodyText,
    },
    meta: {
      attemptCount,
    },
    error: {
      phase,
      message: safeMessage,
      attemptCount,
    },
  };

  return error;
};

export async function executeOutgoingWebhook({
  subdomain,
  targetType,
  target,
  action,
}: {
  subdomain: string;
  targetType: string;
  target: Record<string, unknown>;
  action: IAutomationAction<TOutgoinWebhookActionConfig>;
}): Promise<TOutgoingWebhookResult> {
  const {
    method = 'POST',
    url,
    queryParams = [],
    bodyMode = 'json',
    body,
    auth,
    headers = [],
    options = {},
  } = action?.config || {};
  const bodyValue = body ?? (bodyMode === 'text' ? '' : '{}');

  if (!url) {
    throw new Error('Outgoing webhook url is required');
  }

  const [pluginName, moduleName] = splitType(targetType);
  const timeoutMs = options.timeout ?? 10000;
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

  const replacedUrl =
    (
      await sendCoreModuleProducer({
        moduleName: 'automations',
        subdomain,
        pluginName,
        producerName: TAutomationProducers.REPLACE_PLACEHOLDERS,
        input: {
          moduleName,
          target: { ...target, type: targetType },
          config: { url },
        },
        defaultValue: { url },
      })
    )?.url || url;

  const replacedBody =
    bodyMode === 'text'
      ? ((
          await sendCoreModuleProducer({
            moduleName: 'automations',
            subdomain,
            pluginName,
            producerName: TAutomationProducers.REPLACE_PLACEHOLDERS,
            input: {
              moduleName,
              target: { ...target, type: targetType },
              config: { bodyText: bodyValue },
            },
            defaultValue: { bodyText: bodyValue },
          })
        )?.bodyText ?? '')
      : await sendCoreModuleProducer({
          moduleName: 'automations',
          subdomain,
          pluginName,
          producerName: TAutomationProducers.REPLACE_PLACEHOLDERS,
          input: {
            moduleName,
            target: { ...target, type: targetType },
            config: bodyValue ? JSON.parse(bodyValue) : {},
          },
          defaultValue: {},
        });

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
  ).map(([key, value]) => ({ name: key, value: String(value ?? '') }));

  let currentUrl = new URL(replacedUrl);
  const query = buildQuery(queryParamsList);
  if (query) {
    currentUrl = new URL(currentUrl.toString() + query);
  }

  let headersObj: Record<string, string> = {};
  for (const [key, value] of Object.entries(replacedHeaders || {})) {
    headersObj[key] = String(value);
  }

  if (!headersObj['Content-Type'] && method !== 'GET' && method !== 'HEAD') {
    headersObj['Content-Type'] =
      bodyMode === 'text' ? 'text/plain; charset=utf-8' : 'application/json';
  }

  let requestBody: unknown = replacedBody;
  if (
    bodyMode === 'json' &&
    headersObj['Content-Type']?.includes('application/json') &&
    requestBody &&
    typeof requestBody !== 'string'
  ) {
    requestBody = JSON.stringify(requestBody);
  }

  if (
    bodyMode === 'text' &&
    requestBody !== undefined &&
    requestBody !== null
  ) {
    requestBody = String(requestBody);
  }

  const authApplied = attachAuth(
    headersObj,
    currentUrl,
    requestBody,
    auth as OutgoingAuthConfig | undefined,
  );
  headersObj = authApplied.headers;
  currentUrl = authApplied.url;
  requestBody = authApplied.body;

  const requestUrl = currentUrl.toString();
  const requestBodyText =
    requestBody === undefined || requestBody === null
      ? undefined
      : typeof requestBody === 'string'
        ? requestBody
        : JSON.stringify(requestBody);

  let agent: ReturnType<typeof generateFetchAgent>;
  try {
    agent = generateFetchAgent(options);
  } catch (e) {
    throw createOutgoingWebhookError({
      phase: 'build',
      message: e instanceof Error ? e.message : String(e),
      method,
      url: requestUrl,
      requestHeaders: headersObj,
      requestBodyText,
      attemptCount: 0,
    });
  }

  let lastErr: unknown;
  const attempts = Math.max(0, retryOpts.attempts || 0) + 1;

  for (let i = 1; i <= attempts; i++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

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

      if (RETRYABLE_STATUS_CODES.has(res.status) && i < attempts) {
        clearTimeout(timer);
        const delay = applyBackoff(
          retryOpts.delay || 1000,
          retryOpts.backoff || 'none',
          i,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      const bodyText = await res.text();
      clearTimeout(timer);

      return createOutgoingWebhookResult({
        method,
        url: requestUrl,
        requestHeaders: headersObj,
        requestBodyText,
        attemptCount: i,
        response: res,
        bodyText,
      });
    } catch (e) {
      lastErr = e;
      clearTimeout(timer);

      if (i === attempts) {
        break;
      }

      const delay = applyBackoff(
        retryOpts.delay || 1000,
        retryOpts.backoff || 'none',
        i,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  if (lastErr instanceof Error && lastErr.name === 'AbortError') {
    throw createOutgoingWebhookError({
      phase: 'timeout',
      message: `Outgoing webhook timed out after ${timeoutMs}ms`,
      method,
      url: requestUrl,
      requestHeaders: headersObj,
      requestBodyText,
      attemptCount: attempts,
    });
  }

  if (lastErr instanceof Error) {
    throw createOutgoingWebhookError({
      phase: 'network',
      message: lastErr.message,
      method,
      url: requestUrl,
      requestHeaders: headersObj,
      requestBodyText,
      attemptCount: attempts,
    });
  }

  throw createOutgoingWebhookError({
    phase: 'network',
    message: 'Outgoing webhook failed',
    method,
    url: requestUrl,
    requestHeaders: headersObj,
    requestBodyText,
    attemptCount: attempts,
  });
}
