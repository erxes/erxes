import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationTrigger } from '@/automations/components/builder/hooks/useAutomationTrigger';
import { useActionTarget } from '@/automations/components/builder/nodes/hooks/useActionTarget';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import {
  generateAutomationElementId,
  TAutomationAction,
  useFormValidationErrorHandler,
} from 'ui-modules';
import {
  splitConditionsConfigFormSchema,
  TSplitConditionsConfigForm,
} from '../states/splitConditionsConfigForm';
import { TTransformConfigForm } from '@/automations/components/builder/nodes/actions/transform/states/transformForm';
import { getAiAgentOutputVariables } from '../utils/aiAgentOutputVariables';

const getDefaultOption = (): TSplitConditionsConfigForm['options'][number] => ({
  id: generateAutomationElementId(),
  label: 'Option 1',
});

const getTransformOutputVariableType = (type?: string) => {
  if (type === 'number' || type === 'boolean') {
    return type;
  }

  return 'string';
};

export const useSplitCondtionsConfigForm = (
  currentAction: TAutomationAction<TSplitConditionsConfigForm>,
) => {
  const { trigger } = useAutomationTrigger(currentAction.id);
  const { triggerConstMap } = useAutomation();
  const { actions } = useAutomationNodes();
  const { selectedActionType } = useActionTarget({
    actionId: currentAction.id,
    targetActionId: currentAction.targetActionId,
  });
  const selectedTargetAction = actions.find(
    (action) => action.id === currentAction.targetActionId,
  );
  const contentType = selectedActionType || trigger?.type || '';
  const isOutputVariableCondition = Boolean(
    selectedTargetAction?.type === 'transform' ||
      selectedTargetAction?.type === 'aiAgent' ||
      trigger?.isCustom,
  );
  const triggerOutputVariables =
    trigger?.type && triggerConstMap.get(trigger.type)?.output?.variables;
  const transformOutputVariables = useMemo(
    () =>
      selectedTargetAction?.type === 'transform'
        ? (
            (selectedTargetAction.config as TTransformConfigForm)?.mappings ||
            []
          )
            .filter((mapping) => mapping?.key)
            .map((mapping) => ({
              name: `data.${mapping.key}`,
              label: mapping.key,
              type: getTransformOutputVariableType(mapping.type),
            }))
        : [],
    [selectedTargetAction],
  );
  const aiAgentOutputVariables = useMemo(
    () =>
      selectedTargetAction?.type === 'aiAgent'
        ? getAiAgentOutputVariables(selectedTargetAction.config)
        : [],
    [selectedTargetAction],
  );
  const actionOutputVariables = [
    ...transformOutputVariables,
    ...aiAgentOutputVariables,
  ];
  const outputVariables =
    actionOutputVariables.length > 0
      ? actionOutputVariables
      : (trigger?.config as any)?.outVariables ||
        (trigger?.config as any)?.outputVariables ||
        (trigger?.config as any)?.schema ||
        triggerOutputVariables ||
        [];
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Split conditions configuration',
  });
  const form = useForm<TSplitConditionsConfigForm>({
    resolver: zodResolver(splitConditionsConfigFormSchema),
    defaultValues: {
      options: currentAction.config?.options?.length
        ? currentAction.config.options
        : [getDefaultOption()],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options',
    keyName: 'fieldId',
  });
  const [dirtyConditionOptions, setDirtyConditionOptions] = useState<
    Record<string, boolean>
  >({});
  const hasDirtyConditionOptions = Object.values(dirtyConditionOptions).some(
    Boolean,
  );

  const handleConditionDirtyChange = useCallback(
    (optionId: string, isDirty: boolean) => {
      setDirtyConditionOptions((current) => ({
        ...current,
        [optionId]: isDirty,
      }));
    },
    [],
  );

  const addOption = () => {
    append({
      id: generateAutomationElementId(),
      label: `Option ${fields.length + 1}`,
    });
  };

  // Conditions read a step's output; on the record they are never shown.
  const hasConditionsWithoutSource =
    !isOutputVariableCondition &&
    (currentAction.config?.options || []).some(
      ({ segmentId, config }) =>
        !segmentId && (config?.conditions?.length || 0) > 0,
    );

  return {
    form,
    addOption,
    hasConditionsWithoutSource,
    handleConditionDirtyChange,
    hasDirtyConditionOptions,
    fields,
    contentType,
    isOutputVariableCondition,
    outputVariables,
    handleValidationErrors,
    remove,
  };
};
