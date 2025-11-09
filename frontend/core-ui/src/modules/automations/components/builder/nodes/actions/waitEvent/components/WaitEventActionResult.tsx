import { ActionResultComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { copyText } from '@/automations/utils/automationBuilderUtils/triggerUtils';
import { IconCopy } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { AutomationNodeMetaInfoRow } from 'ui-modules';

export const WaitEventActionResult = ({
  result,
  action,
}: ActionResultComponentProps<{ waiting: string; description: string }>) => {
  const { waiting, description } = result || {};
  const { targetType } = action?.actionConfig || {};
  console.log({ action });

  const isWaitingWebhookEvent = action?.actionConfig?.targetType === 'custom';
  return (
    <div className="m-2">
      <AutomationNodeMetaInfoRow
        fieldName="Waiting"
        content={
          isWaitingWebhookEvent ? (
            <Button variant="link" onClick={() => copyText(waiting)}>
              <IconCopy /> Copy Url
            </Button>
          ) : (
            waiting
          )
        }
      />
      <AutomationNodeMetaInfoRow
        fieldName="Description"
        content={description}
      />
    </div>
  );
};
