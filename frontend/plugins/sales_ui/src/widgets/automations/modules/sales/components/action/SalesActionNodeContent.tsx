import {
  AutomationActionNodeConfigProps,
  AutomationNodeMetaInfoRow,
  splitAutomationNodeType,
} from 'ui-modules';
import { TChecklistActionConfigForm } from '../../states/checklistActionConfigFormDefinitions';
import { TSalesActionConfigForm } from '../../states/salesActionConfigFormDefinitions';
import { BoardPipelineStageInlineText } from '../BoardPipelineStageInlineText';

type TSalesAutomationActionConfigForm =
  | TSalesActionConfigForm
  | TChecklistActionConfigForm;

const isChecklistConfig = (
  config?: TSalesAutomationActionConfigForm,
): config is TChecklistActionConfigForm =>
  !!config && 'items' in config && Array.isArray(config.items);

export const SalesActionNodeContent = ({
  actionData,
  config,
}: AutomationActionNodeConfigProps<TSalesAutomationActionConfigForm>) => {
  const [, , collectionType] = splitAutomationNodeType(actionData.type);

  if (collectionType === 'checklist' && isChecklistConfig(config)) {
    return (
      <div>
        <AutomationNodeMetaInfoRow
          fieldName="Checklist name"
          content={config.name}
        />
        <AutomationNodeMetaInfoRow
          fieldName="Checklist items"
          content={String(config.items.filter((item) => !!item.label).length)}
        />
      </div>
    );
  }

  const dealConfig = isChecklistConfig(config) ? undefined : config;
  const rest = Object.entries(dealConfig || {}).filter(
    ([key, value]) =>
      !['boardId', 'pipelineId', 'stageId'].includes(key) && !!value,
  );

  return (
    <div>
      <BoardPipelineStageInlineText config={dealConfig} />
      {rest.map(([key, value]) => (
        <AutomationNodeMetaInfoRow key={key} fieldName={key} content={value} />
      ))}
    </div>
  );
};
