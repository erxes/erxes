import { ActionResultComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { Badge, Button, Dialog } from 'erxes-ui';
import { IconEye } from '@tabler/icons-react';
import ReactJson from 'react-json-view';

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

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-3 rounded-lg border p-4">
    <h4 className="text-sm font-medium">{title}</h4>
    {children}
  </div>
);

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) => {
  if (
    value === undefined ||
    value === null ||
    (typeof value === 'string' && !value.trim())
  ) {
    return null;
  }

  return (
    <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3 text-sm">
      <div className="text-muted-foreground">{label}</div>
      <div className="min-w-0 break-words">{value}</div>
    </div>
  );
};

export const OutgoinWebhookActionResponse = ({
  result,
}: ActionResultComponentProps<TWebhookHistoryResult>) => {
  const request = result?.request || {};
  const response = result?.response;
  const error = result?.error;
  const attemptCount = result?.meta?.attemptCount || error?.attemptCount;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {response ? (
          <Badge variant={response.ok ? 'success' : 'destructive'}>
            {response.status || 'N/A'} {response.statusText || ''}
          </Badge>
        ) : null}

        {error ? (
          <Badge variant="destructive">{error.phase || 'error'}</Badge>
        ) : null}

        {attemptCount ? (
          <Badge variant="secondary">
            {attemptCount} attempt{attemptCount > 1 ? 's' : ''}
          </Badge>
        ) : null}
      </div>

      <div className="space-y-2 text-sm">
        <InfoRow label="Method" value={request.method} />
        <InfoRow label="URL" value={request.url} />
        <InfoRow
          label="Content Type"
          value={response?.contentType || request.headers?.['Content-Type']}
        />
        <InfoRow label="Error" value={error?.message} />
      </div>

      <Dialog>
        <Dialog.Trigger asChild>
          <Button variant="ghost" className="px-0">
            <IconEye className="mr-2 h-4 w-4" />
            See Request & Response
          </Button>
        </Dialog.Trigger>
        <Dialog.Content className="max-w-5xl overflow-hidden">
          <Dialog.Header className="space-y-1 text-left">
            <Dialog.Title>Outgoing Webhook Result</Dialog.Title>
            <Dialog.Description>
              Review the final request and received response for this webhook
              action.
            </Dialog.Description>
          </Dialog.Header>

          <div className="grid max-h-[70vh] gap-4 overflow-auto pr-2 md:grid-cols-2">
            <Section title="Request">
              <InfoRow label="Method" value={request.method} />
              <InfoRow label="URL" value={request.url} />
              <InfoRow
                label="Attempts"
                value={attemptCount ? <span>{attemptCount}</span> : undefined}
              />

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Headers</div>
                <ReactJson
                  src={request.headers || {}}
                  collapsed={1}
                  name={false}
                  enableClipboard={false}
                  displayDataTypes={false}
                />
              </div>

              {request.bodyText ? (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Body</div>
                  <pre className="max-h-72 overflow-auto rounded-md bg-muted p-3 text-xs whitespace-pre-wrap break-words">
                    {request.bodyText}
                  </pre>
                </div>
              ) : null}
            </Section>

            <Section title={error ? 'Error' : 'Response'}>
              {response ? (
                <>
                  <InfoRow label="Status" value={response.status} />
                  <InfoRow label="Status Text" value={response.statusText} />
                  <InfoRow
                    label="Success"
                    value={response.ok ? 'true' : 'false'}
                  />
                  <InfoRow label="Content Type" value={response.contentType} />
                </>
              ) : null}

              {error ? (
                <>
                  <InfoRow label="Phase" value={error.phase} />
                  <InfoRow label="Message" value={error.message} />
                </>
              ) : null}

              {response?.headers ? (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Headers</div>
                  <ReactJson
                    src={response.headers}
                    collapsed={1}
                    name={false}
                    enableClipboard={false}
                    displayDataTypes={false}
                  />
                </div>
              ) : null}

              {response?.bodyJson !== undefined ? (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">JSON Body</div>
                  <ReactJson
                    src={response.bodyJson}
                    collapsed={1}
                    name={false}
                    enableClipboard={false}
                    displayDataTypes={false}
                  />
                </div>
              ) : response?.bodyText ? (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Body</div>
                  <pre className="max-h-72 overflow-auto rounded-md bg-muted p-3 text-xs whitespace-pre-wrap break-words">
                    {response.bodyText}
                  </pre>
                </div>
              ) : null}
            </Section>
          </div>
        </Dialog.Content>
      </Dialog>
    </div>
  );
};
