import { TDelayConfigForm } from '@/automations/components/builder/nodes/actions/delay/states/delayConfigForm';
import { MetaFieldLine } from '@/automations/components/builder/nodes/components/MetaFieldLine';
import { NodeContentComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';

export const DelayNodeContent = ({
  config,
}: NodeContentComponentProps<TDelayConfigForm>) => {
  const { value, type } = config || {};
  return <MetaFieldLine fieldName="Delay for" content={`${value} ${type}s`} />;
};
