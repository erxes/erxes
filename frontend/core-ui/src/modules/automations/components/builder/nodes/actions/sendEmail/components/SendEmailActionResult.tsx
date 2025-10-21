import { useSendEmailActionResult } from '@/automations/components/builder/nodes/actions/sendEmail/hooks/useSendEmailActionResult';
import { MetaFieldLine } from '@/automations/components/builder/nodes/components/MetaFieldLine';
import { IconEye } from '@tabler/icons-react';
import { Badge, Button, Popover, Tooltip } from 'erxes-ui';

export const AutomationSendEmailActionResult = ({
  result,
}: {
  result: any;
}) => {
  const { getLabelColor, getLabelText } = useSendEmailActionResult();
  const { fromEmail = '', title, responses } = result;

  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button variant="ghost">
          See <IconEye />
        </Button>
      </Popover.Trigger>
      <Popover.Content>
        <MetaFieldLine fieldName="From" content={fromEmail} />

        <MetaFieldLine fieldName="Title" content={title} />

        <MetaFieldLine
          fieldName="To"
          content={
            <>
              {responses.map((response: any, i: number) => (
                <Tooltip key={i}>
                  <Tooltip.Trigger>
                    <Badge variant={getLabelColor(response)}>
                      {response?.toEmail || ''}
                    </Badge>
                  </Tooltip.Trigger>
                  <Tooltip.Content>{getLabelText(response)}</Tooltip.Content>
                </Tooltip>
              ))}
            </>
          }
        />
      </Popover.Content>
    </Popover>
  );
};
