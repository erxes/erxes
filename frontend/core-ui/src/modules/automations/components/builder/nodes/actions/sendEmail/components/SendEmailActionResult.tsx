import { useSendEmailActionResult } from '@/automations/components/builder/nodes/actions/sendEmail/hooks/useSendEmailActionResult';
import { AutomationNodeMetaInfoRow } from 'ui-modules';
import { IconEye } from '@tabler/icons-react';
import { Badge, Button, Dialog, Popover, Tooltip } from 'erxes-ui';

export const AutomationSendEmailActionResult = ({
  result,
}: {
  result: any;
}) => {
  const { getLabelColor, getLabelText } = useSendEmailActionResult();
  const { fromEmail = '', title, response, customHtml } = result;

  return (
    <div className="flex flex-row gap-2 items-center justify-between w-full">
      <div className="flex-1 overflow-x-auto whitespace-nowrap py-2">
        {response.error ? (
          <AutomationNodeMetaInfoRow
            fieldName="Error"
            content={
              <div className="text-destructive ">{getLabelText(response)}</div>
            }
          />
        ) : (
          'Sent successfully'
        )}
      </div>
      <Popover>
        <Popover.Trigger asChild>
          <Button variant="ghost">
            See <IconEye />
          </Button>
        </Popover.Trigger>
        <Popover.Content>
          <AutomationNodeMetaInfoRow fieldName="From" content={fromEmail} />

          <AutomationNodeMetaInfoRow fieldName="Title" content={title} />

          <AutomationNodeMetaInfoRow
            fieldName="To"
            content={
              <Badge variant={getLabelColor(response)}>
                {(response?.toEmails || []).join(', ') || ''}
              </Badge>
            }
          />
          {response?.ccEmails?.length && (
            <AutomationNodeMetaInfoRow
              fieldName="CC"
              content={
                <Badge variant={getLabelColor(response)}>
                  {(response?.ccEmails || []).join(', ') || ''}
                </Badge>
              }
            />
          )}
          <AutomationNodeMetaInfoRow fieldName="Subject" content={title} />
          <AutomationNodeMetaInfoRow
            fieldName="Contet"
            content={
              <Dialog>
                <Dialog.Trigger asChild>
                  <Button variant="ghost">
                    See Content
                    <IconEye />
                  </Button>
                </Dialog.Trigger>
                <Dialog.Content>
                  <div dangerouslySetInnerHTML={{ __html: customHtml || '' }} />
                </Dialog.Content>
              </Dialog>
            }
          />
        </Popover.Content>
      </Popover>
    </div>
  );
};
