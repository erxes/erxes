import { useSendEmailActionResult } from '@/automations/components/builder/nodes/actions/sendEmail/hooks/useSendEmailActionResult';
import { ActionResultComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
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

      <ActionResult.Body title="Email content" html={html || undefined}>
        {!html && text ? (
          <pre className="whitespace-pre-wrap break-all font-mono text-xs">
            {text}
          </pre>
        ) : null}
      </ActionResult.Body>
    </>
  );
};
