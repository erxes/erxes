import { TAutomationWaitEventConfig } from '@/automations/components/builder/nodes/actions/waitEvent/type/waitEvent';
import { MetaFieldLine } from '@/automations/components/builder/nodes/components/MetaFieldLine';
import { NodeContentComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';

const nodeContentMaps = {
  custom: 'Webhook is received',
  trigger: 'Trigger condition is met',
  action: 'Action condition is met',
};

export const WaitEventNodeContent = ({
  config,
}: NodeContentComponentProps<TAutomationWaitEventConfig>) => {
  const text = nodeContentMaps[config?.targetType];
  return <MetaFieldLine fieldName="When" content={text} />;
};
