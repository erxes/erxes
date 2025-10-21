import { AutomationNodesType } from '@/automations/types';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { useReactFlow } from '@xyflow/react';
import { useCallback } from 'react';
import {
  Path,
  PathValue,
  SetValueConfig,
  useFormContext,
} from 'react-hook-form';

export const useAutomationFormController = () => {
  const { getValues, setValue } = useFormContext<TAutomationBuilderForm>();
  const { getNode } = useReactFlow();

  const syncPositionUpdates = useCallback(() => {
    const [triggers, actions, workflows]: [
      TAutomationBuilderForm[AutomationNodesType.Triggers],
      TAutomationBuilderForm[AutomationNodesType.Actions],
      TAutomationBuilderForm[AutomationNodesType.Workflows],
    ] = getValues([
      AutomationNodesType.Triggers,
      AutomationNodesType.Actions,
      AutomationNodesType.Workflows,
    ]);

    for (const { nodeType, nodes } of [
      { nodeType: AutomationNodesType.Triggers, nodes: triggers },
      { nodeType: AutomationNodesType.Actions, nodes: actions },
      { nodeType: AutomationNodesType.Workflows, nodes: workflows },
    ]) {
      setValue(
        `${nodeType}`,
        nodes.map((n) => ({
          ...n,
          position: getNode(n.id)?.position || n.position,
        })),
      );
    }
  }, [setValue]);

  const setValueFn = useCallback(
    (
      path: Path<TAutomationBuilderForm>,
      value: PathValue<TAutomationBuilderForm, Path<TAutomationBuilderForm>>,
      options?: SetValueConfig,
    ) => {
      syncPositionUpdates();
      setValue(path, value, options);
    },
    [setValue],
  );

  return {
    setAutomationBuilderFormValue: setValueFn,
    syncPositionUpdates,
  };
};
