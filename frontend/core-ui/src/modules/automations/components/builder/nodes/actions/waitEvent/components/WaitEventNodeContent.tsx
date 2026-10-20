import { useTranslation } from 'react-i18next';
import { TAutomationWaitEventConfig } from '@/automations/components/builder/nodes/actions/waitEvent/type/waitEvent';
import { AutomationNodeMetaInfoRow } from 'ui-modules';
import { NodeContentComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';

const nodeContentMaps = {
  custom: 'wait-event-when-custom',
  trigger: 'wait-event-when-trigger',
  action: 'wait-event-when-action',
};

export const WaitEventNodeContent = ({
  config,
}: NodeContentComponentProps<TAutomationWaitEventConfig>) => {
  const { t } = useTranslation('automations');
  const textKey = nodeContentMaps[config?.targetType];
  return (
    <AutomationNodeMetaInfoRow
      fieldName={t('wait-event-when')}
      content={textKey ? t(textKey) : undefined}
    />
  );
};
