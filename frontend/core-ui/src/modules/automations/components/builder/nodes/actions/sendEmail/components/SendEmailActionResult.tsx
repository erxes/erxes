import { useSendEmailActionResult } from '@/automations/components/builder/nodes/actions/sendEmail/hooks/useSendEmailActionResult';
import { TAutomationSendEmailConfig } from '@/automations/components/builder/nodes/actions/sendEmail/states/sendEmailConfigForm';
import { ActionResultComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { AutomationNodeMetaInfoRow } from 'ui-modules';
import { IconEye } from '@tabler/icons-react';
import { Badge, Button, Dialog, Popover } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const AutomationSendEmailActionResult = ({
  result,
  action,
}: ActionResultComponentProps<any>) => {
  const { t } = useTranslation('automations');
  const { getLabelColor, getLabelText } = useSendEmailActionResult();
  const config = (action?.actionConfig ||
    {}) as Partial<TAutomationSendEmailConfig>;
  const response = result?.response || {};
  const subject = result?.title || config.subject || '';
  const fromValue =
    response?.from ||
    result?.fromEmail ||
    (config.type === 'default'
      ? 'COMPANY EMAIL'
      : config.fromEmailPlaceHolder) ||
    '';
  const toValue =
    Array.isArray(response?.toEmails) && response.toEmails.length
      ? response.toEmails.join(', ')
      : config.toEmailsPlaceHolders || '';
  const ccValue =
    Array.isArray(response?.ccEmails) && response.ccEmails.length
      ? response.ccEmails.join(', ')
      : config.ccEmailsPlaceHolders || '';
  const htmlContent = result?.customHtml || config.html || '';
  const textContent = config.content || '';
  const hasContent = Boolean(htmlContent || textContent);
  const errorText = response?.error ? getLabelText(response) : '';

  return (
    <div className="flex flex-col gap-2 items-center justify-between w-full">
      <div className="min-w-0 flex-1 py-2">
        {response.error ? (
          <div className="text-destructive">{errorText}</div>
        ) : (
          t('sent-successfully', 'Sent successfully')
        )}
      </div>
      <Popover>
        <Popover.Trigger asChild>
          <Button variant="ghost">
            See <IconEye />
          </Button>
        </Popover.Trigger>
        <Popover.Content>
          <AutomationNodeMetaInfoRow fieldName="From" content={fromValue} />

          <AutomationNodeMetaInfoRow fieldName="Subject" content={subject} />

          <AutomationNodeMetaInfoRow
            fieldName="To"
            content={
              toValue ? (
                <Badge variant={getLabelColor(response)}>{toValue}</Badge>
              ) : (
                ''
              )
            }
          />
          {ccValue && (
            <AutomationNodeMetaInfoRow
              fieldName="CC"
              content={
                <Badge variant={getLabelColor(response)}>{ccValue}</Badge>
              }
            />
          )}
          <AutomationNodeMetaInfoRow
            fieldName="Content"
            content={
              hasContent ? (
                <Dialog>
                  <Dialog.Trigger asChild>
                    <Button variant="ghost">
                      {t('see-content', 'See Content')}
                      <IconEye />
                    </Button>
                  </Dialog.Trigger>
                  <Dialog.Content>
                    {htmlContent ? (
                      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                    ) : (
                      <pre className="font-mono text-xs whitespace-pre-wrap break-words">
                        {textContent}
                      </pre>
                    )}
                  </Dialog.Content>
                </Dialog>
              ) : (
                ''
              )
            }
          />
        </Popover.Content>
      </Popover>
    </div>
  );
};
