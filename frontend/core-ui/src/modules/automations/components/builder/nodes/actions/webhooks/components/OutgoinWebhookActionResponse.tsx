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
  const request = result?.request || {};
  const response = result?.response;
  const error = result?.error;
  const attemptCount = result?.meta?.attemptCount || error?.attemptCount;

  const statusText = error
    ? error.message || error.phase || 'Request failed'
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

  return (
    <>
      <ActionResult.Status status={hasError ? 'error' : 'success'}>
        {statusText}
        {attemptCount ? (
          <Badge variant="secondary" className="ml-2">
            {attemptCount} attempt{attemptCount > 1 ? 's' : ''}
          </Badge>
        ) : null}
      </ActionResult.Status>

      <ActionResult.Fields>
        <ActionResult.Field label="Method" value={request.method} />
        <ActionResult.Field label="URL" value={request.url} />
        <ActionResult.Field
          label="Type"
          value={response?.contentType || request.headers?.['Content-Type']}
        />
        <ActionResult.Field label="Phase" value={error?.phase} />
      </ActionResult.Fields>

      {request.bodyText ? (
        <ActionResult.Body title="Request body">
          <ActionResult.Json value={request.bodyText} />
        </ActionResult.Body>
      ) : null}

      {responseBody !== undefined ? (
        <ActionResult.Body title="Response body">
          <ActionResult.Json value={responseBody} />
        </ActionResult.Body>
      ) : null}
    </>
  );
};
