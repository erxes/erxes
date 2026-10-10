import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('automations');
  const { waiting, description } = result || {};
  const isWaitingWebhookEvent = action?.actionConfig?.targetType === 'custom';

  return (
    <>
      <ActionResult.Status status="waiting">
        {description || t('wait-event-waiting-for-event')}
      </ActionResult.Status>
      <ActionResult.Fields>
        <ActionResult.Field
          label={t('wait-event-waiting')}
          value={
            isWaitingWebhookEvent ? (
              <Button
                variant="link"
                size="sm"
                onClick={() => copyText(waiting)}
              >
                <IconCopy /> {t('wait-event-copy-url')}
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
