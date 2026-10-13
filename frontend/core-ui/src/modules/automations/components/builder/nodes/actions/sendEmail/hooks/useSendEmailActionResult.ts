import { useTranslation } from 'react-i18next';
import { TAutomationSendEmailConfig } from '@/automations/components/builder/nodes/actions/sendEmail/states/sendEmailConfigForm';
import { getActionResultErrorText } from '@/automations/utils/automationHistoryUtils/executionResultPreview';
import { IAutomationHistoryAction } from 'ui-modules';

export const useSendEmailActionResult = (
  result: any,
  action: IAutomationHistoryAction,
) => {
  const { t } = useTranslation('automations');
  const config = (action?.actionConfig ||
    {}) as Partial<TAutomationSendEmailConfig>;
  const response = result?.response || {};

  const joinEmails = (emails?: string[], fallback?: string) =>
    Array.isArray(emails) && emails.length ? emails.join(', ') : fallback || '';

  const hasError = Boolean(response?.error);

  return {
    hasError,
    statusText: hasError
      ? getActionResultErrorText(response.error)
      : t('send-email-sent-successfully'),
    from:
      response?.from ||
      result?.fromEmail ||
      (config.type === 'default'
        ? t('send-email-company-email')
        : config.fromEmailPlaceHolder) ||
      '',
    subject: result?.title || config.subject || '',
    to: joinEmails(response?.toEmails, config.toEmailsPlaceHolders),
    cc: joinEmails(response?.ccEmails, config.ccEmailsPlaceHolders),
    html: result?.customHtml || config.html || '',
    text: config.content || '',
  };
};
