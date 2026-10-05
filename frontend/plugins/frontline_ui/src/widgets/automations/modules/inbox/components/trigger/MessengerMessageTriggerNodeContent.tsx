import { AutomationNodeMetaInfoRow } from 'ui-modules';
import type { AutomationTriggerConfigProps } from 'ui-modules';
import { useIntegrationDetail } from '@/integrations/hooks/useIntegrationDetail';

const EVENT_LABELS: Record<string, string> = {
  directMessage: 'Direct Message',
  getStarted: 'Get Started',
  quickReply: 'Quick Reply',
  customerRegistration: 'Customer Registration',
};

type TMessengerMessageCondition = {
  type: string;
  isSelected?: boolean;
};

type TMessengerMessageConfig = {
  integrationId?: string;
  conditions?: TMessengerMessageCondition[];
};

export const MessengerMessageTriggerNodeContent = ({
  config,
}: AutomationTriggerConfigProps<TMessengerMessageConfig>) => {
  const { integrationDetail } = useIntegrationDetail({
    integrationId: config?.integrationId || null,
  });
  const conditions = config?.conditions || [];
  const selected = conditions.filter((c) => c.isSelected);

  const content = selected.length
    ? selected.map((c) => EVENT_LABELS[c.type] || c.type).join(', ')
    : 'No events selected';

  return (
    <>
      <AutomationNodeMetaInfoRow
        fieldName="Messenger"
        content={
          config?.integrationId
            ? integrationDetail?.name || config.integrationId
            : 'All erxes messengers'
        }
      />
      <AutomationNodeMetaInfoRow fieldName="Events" content={content} />
    </>
  );
};
