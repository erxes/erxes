import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('automations');

  return (
    <>
      <ActionResult.Status status={hasError ? 'error' : 'success'}>
        {statusText}
      </ActionResult.Status>

      <ActionResult.Fields>
        <ActionResult.Field label={t('from')} value={from} />
        <ActionResult.Field label={t('subject')} value={subject} />
        <ActionResult.Field
          label={t('to')}
          value={to}
          badge={hasError ? 'destructive' : 'success'}
        />
        <ActionResult.Field label={t('cc')} value={cc} badge="secondary" />
      </ActionResult.Fields>

      {html ? (
        <SendEmailResultEmailPreview
          html={html}
          from={from}
          subject={subject}
          to={to}
        />
      ) : (
        <ActionResult.Body title={t('send-email-result-content')}>
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
