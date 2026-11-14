import { useTranslation } from 'react-i18next';
import { ActionResultComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { Badge } from 'erxes-ui';
import { ActionResult } from 'ui-modules';
import {
  TWebhookHistoryResult,
  useOutgoingWebhookResult,
} from '@/automations/components/builder/nodes/actions/webhooks/hooks/useOutgoingWebhookResult';

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
