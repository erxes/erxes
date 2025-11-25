import {
  AutomationActionNodeConfigProps,
  AutomationNodeMetaInfoRow,
} from 'ui-modules';
import { TSalesActionConfigForm } from '../../states/salesActionConfigFormDefinitions';
import { BoardPipelineStageInlineText } from '../BoardPipelineStageInlineText';
export const SalesActionNodeContent = ({
  config,
}: AutomationActionNodeConfigProps<TSalesActionConfigForm>) => {
  const { boardId, pipelineId, stageId, ...rest } = config || {};
  return (
    <div>
      <BoardPipelineStageInlineText config={config} />
      {Object.entries(rest)
        .filter(([key, value]) => !!value)
        .map(([key, value]) => (
          <AutomationNodeMetaInfoRow
            key={key}
            fieldName={key}
            content={value}
          />
        ))}
    </div>
  );
};
