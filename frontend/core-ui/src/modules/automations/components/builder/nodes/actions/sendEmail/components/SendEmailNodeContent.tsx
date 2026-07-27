import { TAutomationSendEmailConfig } from '@/automations/components/builder/nodes/actions/sendEmail/states/sendEmailConfigForm';
import { AutomationNodeMetaInfoRow } from 'ui-modules';
import { NodeContentComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { IconEye } from '@tabler/icons-react';
import { Button, Label, Popover } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const SendEmailNodeContent = ({
  config,
}: NodeContentComponentProps<TAutomationSendEmailConfig>) => {
  const { t } = useTranslation('automations');
  const {
    fromEmailPlaceHolder,
    toEmailsPlaceHolders,
    ccEmailsPlaceHolders,
    subject,
    type,
  } = config || {};

  return (
    <>
      <AutomationNodeMetaInfoRow
        fieldName="From"
        content={type === 'default' ? 'COMPANY EMAIL' : fromEmailPlaceHolder}
      />
      <AutomationNodeMetaInfoRow
        fieldName="Reciepents"
        content={
          <Popover>
            <Popover.Trigger asChild>
              <Button variant="ghost">
                {t('see-emails', 'See Emails')}
                <IconEye />
              </Button>
            </Popover.Trigger>
            <Popover.Content>
              <Label>{t('recipient-emails', 'Recipient emails')}</Label>
              <AutomationNodeMetaInfoRow
                fieldName="To"
                content={toEmailsPlaceHolders}
              />
              {ccEmailsPlaceHolders && (
                <AutomationNodeMetaInfoRow
                  fieldName="CC"
                  content={ccEmailsPlaceHolders}
                />
              )}
            </Popover.Content>
          </Popover>
        }
      />
      <AutomationNodeMetaInfoRow fieldName="Subject" content={subject} />
    </>
  );
};
