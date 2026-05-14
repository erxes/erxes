import { WaitEventConfigCustomForm } from '@/automations/components/builder/nodes/actions/waitEvent/components/WaitEventConfigCustomForm';
import { WaitEventConfigSegmentForm } from '@/automations/components/builder/nodes/actions/waitEvent/components/WaitEventConfigSegmentForm';
import { TAutomationWaitEventConfig } from '@/automations/components/builder/nodes/actions/waitEvent/type/waitEvent';
import { TAutomationAction } from 'ui-modules';
import { TAutomationActionConfigFieldPrefix } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';

export function WaitEventConfigContent({
  targetType,
  action,
  selectedNodeId,
  configFieldNamePrefix,
  handleSave,
}: {
  targetType: TAutomationWaitEventConfig['targetType'];
  action: TAutomationAction;
  selectedNodeId?: string;
  configFieldNamePrefix: TAutomationActionConfigFieldPrefix;
  handleSave: (config: TAutomationWaitEventConfig) => void;
}) {
  if (targetType === 'custom') {
    return (
      <WaitEventConfigCustomForm
        configFieldNamePrefix={configFieldNamePrefix}
        handleSave={handleSave}
      />
    );
  }

  return (
    <WaitEventConfigSegmentForm
      targetType={targetType}
      action={action}
      selectedNodeId={selectedNodeId}
      configFieldNamePrefix={configFieldNamePrefix}
    />
  );
}
