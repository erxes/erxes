import { TAutomationSendEmailConfig } from '@/automations/components/builder/nodes/actions/sendEmail/states/sendEmailConfigForm';
import { AutomationNodeMetaInfoRow } from 'ui-modules';
import { NodeContentComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { IconEye } from '@tabler/icons-react';
import { Button, Label, Popover } from 'erxes-ui';

export const SendEmailNodeContent = ({
  config,
}: NodeContentComponentProps<TAutomationSendEmailConfig>) => {
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
                See Emails
                <IconEye />
              </Button>
            </Popover.Trigger>
            <Popover.Content>
              <Label>Recipient emails</Label>
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
