import {
  AutomationNodeMetaInfoRow,
  AutomationTriggerConfigProps,
  splitAutomationNodeType,
} from 'ui-modules';
import {
  getOptionLabel,
  OPERATION_COMPLETION_MODE_OPTIONS,
} from '../../constants/operationAutomationConstants';
import { TOperationCompletionTriggerConfigForm } from '../../states/operationCompletionTriggerFormDefinitions';

export const OperationCompletionTriggerNodeContent = ({
  type,
  config,
}: AutomationTriggerConfigProps<TOperationCompletionTriggerConfigForm>) => {
  const [, moduleName, collectionType] = splitAutomationNodeType(type);
  const modeLabel = getOptionLabel(
    OPERATION_COMPLETION_MODE_OPTIONS,
    config?.mode || 'every',
  );

  return (
    <div>
      {moduleName === 'project' && collectionType === 'projects' ? (
        <AutomationNodeMetaInfoRow
          fieldName="Project"
          content={config?.projectId || 'Any project'}
        />
      ) : null}

      {moduleName === 'project' && collectionType === 'milestones' ? (
        <>
          <AutomationNodeMetaInfoRow fieldName="Mode" content={modeLabel} />
          <AutomationNodeMetaInfoRow
            fieldName="Project"
            content={config?.projectId || 'Any project'}
          />
          <AutomationNodeMetaInfoRow
            fieldName="Milestone"
            content={config?.milestoneId || 'Any milestone'}
          />
        </>
      ) : null}

      {moduleName === 'team' ? (
        <>
          <AutomationNodeMetaInfoRow fieldName="Mode" content={modeLabel} />
          <AutomationNodeMetaInfoRow
            fieldName="Teams"
            content={
              config?.teamIds?.length ? config.teamIds.join(', ') : 'Any team'
            }
          />
        </>
      ) : null}
    </div>
  );
};
