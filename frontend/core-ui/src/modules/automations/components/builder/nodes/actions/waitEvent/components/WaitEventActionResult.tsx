import { ActionResultComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { copyText } from '@/automations/utils/automationBuilderUtils/triggerUtils';
import { IconCopy } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { ActionResult } from 'ui-modules';

type TWaitEventResult = { waiting: string; description: string };

export const WaitEventActionResult = ({
  result,
  action,
}: ActionResultComponentProps<TWaitEventResult>) => {
  const { waiting, description } = result || {};
  const isWaitingWebhookEvent = action?.actionConfig?.targetType === 'custom';

  return (
    <>
      <ActionResult.Status status="waiting">
        {description || 'Waiting for an event'}
      </ActionResult.Status>
      <ActionResult.Fields>
        <ActionResult.Field
          label="Waiting"
          value={
            isWaitingWebhookEvent ? (
              <Button
                variant="link"
                size="sm"
                onClick={() => copyText(waiting)}
              >
                <IconCopy /> Copy url
              </Button>
            ) : (
              waiting
            )
          }
        />
      </ActionResult.Fields>
    </>
  );
};
