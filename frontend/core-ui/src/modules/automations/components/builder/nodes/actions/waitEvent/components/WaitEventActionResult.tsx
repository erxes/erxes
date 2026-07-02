import { ActionResultComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { copyText } from '@/automations/utils/automationBuilderUtils/triggerUtils';
import { IconCopy } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { AutomationNodeMetaInfoRow } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const WaitEventActionResult = ({
  result,
  action,
}: ActionResultComponentProps<{ waiting: string; description: string }>) => {
  const { t } = useTranslation('automations');
  const { waiting, description } = result || {};
  const { targetType } = action?.actionConfig || {};

  const isWaitingWebhookEvent = action?.actionConfig?.targetType === 'custom';
  return (
    <div className="m-2">
      <AutomationNodeMetaInfoRow
        fieldName="Waiting"
        content={
          isWaitingWebhookEvent ? (
            <Button variant="link" onClick={() => copyText(waiting)}>
              <IconCopy /> {t('copy-url', 'Copy Url')}
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
