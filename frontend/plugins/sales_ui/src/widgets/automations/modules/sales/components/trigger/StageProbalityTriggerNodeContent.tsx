import {
  AutomationNodeMetaInfoRow,
  AutomationTriggerConfigProps,
} from 'ui-modules';
import { TStageProbalityTriggerConfigForm } from '../../states/stageProbalityTriggerConfigFormDefinitions';

export const StageProbalityTriggerNodeContent = ({
  config,
}: AutomationTriggerConfigProps<TStageProbalityTriggerConfigForm>) => {
  const { probability } = config || {};
  return (
    <div>
      <AutomationNodeMetaInfoRow
        fieldName="When sales card moved to stage with probability"
        content={probability}
      />
    </div>
  );
};
