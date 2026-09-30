import { useSendEmailActionResult } from '@/automations/components/builder/nodes/actions/sendEmail/hooks/useSendEmailActionResult';
import { ActionResultComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { SendEmailResultEmailPreview } from '@/automations/components/builder/nodes/actions/sendEmail/components/SendEmailResultEmailPreview';
import { ActionResult } from 'ui-modules';

export const AutomationSendEmailActionResult = ({
  result,
  action,
}: ActionResultComponentProps<any>) => {
  const { hasError, statusText, from, subject, to, cc, html, text } =
    useSendEmailActionResult(result, action);

  return (
    <>
      <ActionResult.Status status={hasError ? 'error' : 'success'}>
        {statusText}
      </ActionResult.Status>

      <ActionResult.Fields>
        <ActionResult.Field label="From" value={from} />
        <ActionResult.Field label="Subject" value={subject} />
        <ActionResult.Field
          label="To"
          value={to}
          badge={hasError ? 'destructive' : 'success'}
        />
        <ActionResult.Field label="CC" value={cc} badge="secondary" />
      </ActionResult.Fields>

      {html ? (
        <SendEmailResultEmailPreview
          html={html}
          from={from}
          subject={subject}
          to={to}
        />
      ) : (
        <ActionResult.Body title="Email content">
          {text ? (
            <pre className="whitespace-pre-wrap break-all font-mono text-xs">
              {text}
            </pre>
          ) : null}
        </ActionResult.Body>
      )}
    </>
  );
};
