import { useTranslation } from 'react-i18next';

export type TWebhookHistoryResult = {
  request?: {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    bodyText?: string;
  };
  response?: {
    status?: number;
    statusText?: string;
    ok?: boolean;
    headers?: Record<string, string>;
    contentType?: string;
    bodyText?: string;
    bodyJson?: unknown;
  };
  meta?: {
    attemptCount?: number;
  };
  error?: {
    phase?: string;
    message?: string;
    attemptCount?: number;
  };
};

/** What the webhook step sent, what came back, and the line that sums it up. */
export const useOutgoingWebhookResult = (result?: TWebhookHistoryResult) => {
  const { t } = useTranslation('automations');
  const request = result?.request || {};
  const response = result?.response;
  const error = result?.error;
  const attemptCount = result?.meta?.attemptCount || error?.attemptCount;

  const statusText = error
    ? error.message || error.phase || t('webhook-request-failed')
    : `${response?.status ?? 'N/A'} ${response?.statusText || ''}`.trim();

  return {
    request,
    response,
    error,
    attemptCount,
    hasError: Boolean(error) || response?.ok === false,
    statusText,
    responseBody:
      response?.bodyJson !== undefined ? response.bodyJson : response?.bodyText,
  };
};
