import { TAutomationWaitEventConfig } from '@/automations/components/builder/nodes/actions/waitEvent/type/waitEvent';
import { AutomationNodeMetaInfoRow } from 'ui-modules';
import { NodeContentComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { useTranslation } from 'react-i18next';

export const WaitEventNodeContent = ({
  config,
}: NodeContentComponentProps<TAutomationWaitEventConfig>) => {
  const { t } = useTranslation('automations');
  const nodeContentMaps = {
    custom: t('webhook-is-received', 'Webhook is received'),
    trigger: t('trigger-condition-is-met', 'Trigger condition is met'),
    action: t('action-condition-is-met', 'Action condition is met'),
  };
  const text = nodeContentMaps[config?.targetType];
  return <AutomationNodeMetaInfoRow fieldName="When" content={text} />;
};
