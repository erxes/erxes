import {
  AutomationNodeMetaInfoRow,
  AutomationTriggerConfigProps,
} from 'ui-modules';
import { TStageProbalityTriggerConfigForm } from '../../states/stageProbalityTriggerConfigFormDefinitions';

export const StageProbalityTriggerNodeContent = ({
  type,
  config,
}: AutomationTriggerConfigProps<TStageProbalityTriggerConfigForm>) => {
  const { probability, fromStageId, toStageId } = config || {};

  if (type?.endsWith('.stageChanged')) {
    return (
      <div>
        <AutomationNodeMetaInfoRow
          fieldName="When sales card stage changes"
          content={`${fromStageId || 'Any stage'} -> ${toStageId || 'Any stage'}`}
        />
      </div>
    );
  }

  return (
    <div>
      <AutomationNodeMetaInfoRow
        fieldName="When sales card moved to stage with probability"
        content={probability}
      />
    </div>
  );
};
