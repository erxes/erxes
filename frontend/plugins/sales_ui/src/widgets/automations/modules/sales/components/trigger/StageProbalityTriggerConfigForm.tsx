import {
  AutomationTriggerFormProps,
  splitAutomationNodeType,
} from 'ui-modules';
import { TStageProbalityTriggerConfigForm } from '~/widgets/automations/modules/sales/states/stageProbalityTriggerConfigFormDefinitions';
import { StageChangedTriggerConfigForm } from './StageChangedTriggerConfigForm';
import { StageProbabilityTriggerConfigForm } from './StageProbabilityTriggerConfigForm';

export const StageProbalityTriggerConfigForm = ({
  activeTrigger,
  ...props
}: AutomationTriggerFormProps<TStageProbalityTriggerConfigForm>) => {
  const [, , , relationType] = splitAutomationNodeType(activeTrigger?.type);

  if (relationType === 'stageChanged') {
    return (
      <StageChangedTriggerConfigForm {...props} activeTrigger={activeTrigger} />
    );
  }

  if (relationType === 'probability') {
    return (
      <StageProbabilityTriggerConfigForm
        {...props}
        activeTrigger={activeTrigger}
      />
    );
  }

  return <SalesTriggerConfigEmptyState />;
};

const SalesTriggerConfigEmptyState = () => {
  return null;
};
