import { useTranslation } from 'react-i18next';
import { TAutomationSendEmailConfig } from '@/automations/components/builder/nodes/actions/sendEmail/states/sendEmailConfigForm';
import { AutomationNodeMetaInfoRow } from 'ui-modules';
import { NodeContentComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { useSenderOptions } from '@/settings/mail-config/hooks/useVerifiedSenders';
import { IconEye } from '@tabler/icons-react';
import { Button, Label, Popover } from 'erxes-ui';

export const SendEmailNodeContent = ({
  config,
}: NodeContentComponentProps<TAutomationSendEmailConfig>) => {
  const {
    sender,
    fromEmailPlaceHolder,
    replyToEmail,
    toEmailsPlaceHolders,
    ccEmailsPlaceHolders,
    subject,
    type,
  } = config || {};

  const { alignedFrom } = useSenderOptions();
  const { t } = useTranslation('automations');

  const from = alignedFrom
    ? `${sender || ''} <${alignedFrom}>`.trim()
    : type === 'default'
      ? t('send-email-company-email')
      : fromEmailPlaceHolder;

  const replyTo = alignedFrom ? fromEmailPlaceHolder : replyToEmail;

  return (
    <>
      <AutomationNodeMetaInfoRow fieldName={t('from')} content={from} />
      {replyTo && (
        <AutomationNodeMetaInfoRow
          fieldName={t('reply-to')}
          content={replyTo}
        />
      )}
      <AutomationNodeMetaInfoRow
        fieldName={t('send-email-recipients')}
        content={
          <Popover>
            <Popover.Trigger asChild>
              <Button variant="ghost">
                {t('send-email-see-emails')}
                <IconEye />
              </Button>
            </Popover.Trigger>
            <Popover.Content>
              <Label>{t('send-email-recipient-emails')}</Label>
              <AutomationNodeMetaInfoRow
                fieldName={t('to')}
                content={toEmailsPlaceHolders}
              />
              {ccEmailsPlaceHolders && (
                <AutomationNodeMetaInfoRow
                  fieldName={t('cc')}
                  content={ccEmailsPlaceHolders}
                />
              )}
            </Popover.Content>
          </Popover>
        }
      />
      <AutomationNodeMetaInfoRow fieldName={t('subject')} content={subject} />
    </>
  );
};
