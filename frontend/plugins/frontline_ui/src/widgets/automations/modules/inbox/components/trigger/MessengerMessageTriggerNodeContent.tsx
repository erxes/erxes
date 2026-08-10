import { AutomationNodeMetaInfoRow } from 'ui-modules';
import type { AutomationTriggerConfigProps } from 'ui-modules';

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
  conditions?: TMessengerMessageCondition[];
};

export const MessengerMessageTriggerNodeContent = ({
  config,
}: AutomationTriggerConfigProps<TMessengerMessageConfig>) => {
  const conditions = config?.conditions || [];
  const selected = conditions.filter((c) => c.isSelected);

  const content = selected.length
    ? selected.map((c) => EVENT_LABELS[c.type] || c.type).join(', ')
    : 'No events selected';

  return <AutomationNodeMetaInfoRow fieldName="Events" content={content} />;
};
