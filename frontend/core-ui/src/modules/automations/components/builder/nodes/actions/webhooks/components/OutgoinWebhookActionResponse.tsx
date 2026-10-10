import { useTranslation } from 'react-i18next';
import { ActionResultComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { Badge } from 'erxes-ui';
import { ActionResult } from 'ui-modules';

type TWebhookHistoryResult = {
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
    bodyJson?: any;
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

const useOutgoingWebhookResult = (result?: TWebhookHistoryResult) => {
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

export const OutgoinWebhookActionResponse = ({
  result,
}: ActionResultComponentProps<TWebhookHistoryResult>) => {
  const {
    request,
    response,
    error,
    attemptCount,
    hasError,
    statusText,
    responseBody,
  } = useOutgoingWebhookResult(result);
  const { t } = useTranslation('automations');

  return (
    <>
      <ActionResult.Status status={hasError ? 'error' : 'success'}>
        {statusText}
        {attemptCount ? (
          <Badge variant="secondary" className="ml-2">
            {t('webhook-attempt', { count: attemptCount })}
          </Badge>
        ) : null}
      </ActionResult.Status>

      <ActionResult.Fields>
        <ActionResult.Field
          label={t('webhook-field-method')}
          value={request.method}
        />
        <ActionResult.Field
          label={t('webhook-field-url')}
          value={request.url}
        />
        <ActionResult.Field
          label={t('webhook-field-type')}
          value={response?.contentType || request.headers?.['Content-Type']}
        />
        <ActionResult.Field
          label={t('webhook-field-phase')}
          value={error?.phase}
        />
      </ActionResult.Fields>

      {request.bodyText ? (
        <ActionResult.Body title={t('webhook-request-body')}>
          <ActionResult.Json value={request.bodyText} />
        </ActionResult.Body>
      ) : null}

      {responseBody !== undefined ? (
        <ActionResult.Body title={t('webhook-response-body')}>
          <ActionResult.Json value={responseBody} />
        </ActionResult.Body>
      ) : null}
    </>
  );
};
