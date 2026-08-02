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

  // Where the `From` is rewritten, the picked address is the reply destination
  // and naming it here would claim a sender the message never had.
  const from = alignedFrom
    ? `${sender || ''} <${alignedFrom}>`.trim()
    : type === 'default'
    ? 'COMPANY EMAIL'
    : fromEmailPlaceHolder;

  const replyTo = alignedFrom ? fromEmailPlaceHolder : replyToEmail;

  return (
    <>
      <AutomationNodeMetaInfoRow fieldName="From" content={from} />
      {replyTo && (
        <AutomationNodeMetaInfoRow fieldName="Reply to" content={replyTo} />
      )}
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
