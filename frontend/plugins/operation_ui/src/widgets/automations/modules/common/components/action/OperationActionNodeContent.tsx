import {
  AutomationActionNodeConfigProps,
  AutomationNodeMetaInfoRow,
  splitAutomationNodeType,
} from 'ui-modules';
import {
  getPriorityLabel,
  PROJECT_ACTION_LABELS,
  TASK_ACTION_LABELS,
} from '../../constants/operationAutomationConstants';
import { TOperationActionConfigForm } from '../../states/operationActionConfigFormDefinitions';

const isPresent = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return value !== undefined && value !== null && value !== '';
};

const getContent = (key: string, value: unknown) => {
  if (Array.isArray(value)) {
    return value.join(', ');
  }

  if (key === 'priority') {
    return getPriorityLabel(value);
  }

  return String(value);
};

export const OperationActionNodeContent = ({
  actionData,
  config,
}: AutomationActionNodeConfigProps<TOperationActionConfigForm>) => {
  const [, , collectionType] = splitAutomationNodeType(actionData?.type);
  const labels =
    collectionType === 'projects' ? PROJECT_ACTION_LABELS : TASK_ACTION_LABELS;

  return (
    <div>
      {Object.entries(config || {})
        .filter(([key, value]) => Boolean(labels[key]) && isPresent(value))
        .map(([key, value]) => (
          <AutomationNodeMetaInfoRow
            key={key}
            fieldName={labels[key]}
            content={getContent(key, value)}
          />
        ))}
    </div>
  );
};
