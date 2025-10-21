export type TDelayActionConfig = {
  value: string;
  type: 'minute' | 'hour' | 'day' | 'month' | 'year';
};

export interface OutgoingHeaderItem {
  key: string;
  value: string;
  type: 'fixed' | 'expression';
}

interface OutgoingQueryParamItem {
  name: string;
  value: string;
  type: 'fixed' | 'expression';
}

export interface OutgoingRetryOptions {
  attempts?: number;
  delay?: number;
  backoff?: 'none' | 'fixed' | 'exponential' | 'jitter';
}

interface OutgoingProxyOptions {
  host?: string;
  port?: number;
  auth?: { username?: string; password?: string };
}

interface OutgoingOptions {
  timeout?: number;
  ignoreSSL?: boolean;
  followRedirect?: boolean;
  maxRedirects?: number;
  retry?: OutgoingRetryOptions;
  proxy?: OutgoingProxyOptions;
}

interface BasicAuthConfig {
  type: 'basic';
  username: string;
  password: string;
}
interface BearerAuthConfig {
  type: 'bearer';
  token: string;
}
interface NoneAuthConfig {
  type: 'none';
}
interface JwtAuthConfig {
  type: 'jwt';
  algorithm: string;
  secretKey: string;
  publicKey?: string;
  claims?: Record<string, string | number | boolean>;
  expiresIn?: string;
  audience?: string;
  issuer?: string;
  header?: Record<string, string | number | boolean>;
  placement?: 'header' | 'query' | 'body';
}

export type OutgoingAuthConfig =
  | BasicAuthConfig
  | BearerAuthConfig
  | NoneAuthConfig
  | JwtAuthConfig;

type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS';

export type TOutgoinWebhookActionConfig = {
  method?: HttpMethod;
  url: string;
  queryParams?: OutgoingQueryParamItem[];
  body?: Record<string, any>;
  auth?: OutgoingAuthConfig;
  headers?: OutgoingHeaderItem[];
  options?: OutgoingOptions;
};

export type TIfActionConfig = {
  contentId: string;
  yes: string;
  no: string;
};

type IncomingWebhookHeaders = {
  key: string;
  value: string;
  description: string;
};

type WebhookMethods = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

type IncomingWebhookConfig = {
  endpoint: string;
  method: WebhookMethods;
  headers: IncomingWebhookHeaders[];
  schema: any;
  isEnabledSecurity?: string;
  security?: {
    beararToken: string;
    secret: string;
  };
  timeoutMs?: string;
  maxRetries?: string;
};

export type TAutomationWaitEventConfig = {
  targetType: 'trigger' | 'action' | 'custom';
  targetTriggerId?: string;
  targetActionId?: string;
  segmentId?: string;
  webhookConfig?: IncomingWebhookConfig;
};
