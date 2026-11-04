import type {
  TDelayActionConfig as TDelayActionConfigContract,
  TOutgoingWebhookActionConfig,
} from 'erxes-api-shared/core-modules';

// Executors read exactly the contract the actions publish.
export type TDelayActionConfig = TDelayActionConfigContract;
export type TOutgoinWebhookActionConfig = TOutgoingWebhookActionConfig;

type TOutgoingOptions = NonNullable<TOutgoingWebhookActionConfig['options']>;

export type OutgoingRetryOptions = NonNullable<TOutgoingOptions['retry']>;
export type OutgoingAuthConfig = NonNullable<
  TOutgoingWebhookActionConfig['auth']
>;
export type OutgoingHeaderItem = NonNullable<
  TOutgoingWebhookActionConfig['headers']
>[number];

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
  method: WebhookMethods;
  headers: IncomingWebhookHeaders[];
  schema: any;
  isEnabledSecurity?: string;
  security?: {
    beararToken: string;
    secret: string;
  };
};

export type TAutomationWaitEventConfig = {
  targetType: 'trigger' | 'action' | 'custom';
  targetTypeId?: string;
  targetActionId?: string;
  segmentId?: string;
  webhookConfig?: IncomingWebhookConfig;
};
