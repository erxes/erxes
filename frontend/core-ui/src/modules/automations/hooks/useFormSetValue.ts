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

  const syncPositionUpdates = useCallback(
    (options?: SetValueConfig) => {
      const [triggers, actions, workflows, notes]: [
        TAutomationBuilderForm[AutomationNodesType.Triggers],
        TAutomationBuilderForm[AutomationNodesType.Actions],
        TAutomationBuilderForm[AutomationNodesType.Workflows],
        TAutomationBuilderForm['notes'],
      ] = getValues([
        AutomationNodesType.Triggers,
        AutomationNodesType.Actions,
        AutomationNodesType.Workflows,
        'notes',
      ]);

      for (const { nodeType, nodes } of [
        { nodeType: AutomationNodesType.Triggers, nodes: triggers || [] },
        { nodeType: AutomationNodesType.Actions, nodes: actions || [] },
        { nodeType: AutomationNodesType.Workflows, nodes: workflows || [] },
      ]) {
        setValue(
          `${nodeType}`,
          nodes.map((n) => ({
            ...n,
            position: getNode(n.id)?.position || n.position,
          })),
          options,
        );
      }

      // Notes carry a position too, but they are not flow nodes: kept out of
      // the loop above so `AutomationNodesType` keeps meaning the three lists
      // the canvas connects. Skipped entirely when there are none, so an
      // automation without notes is never marked dirty by this.
      if (notes?.length) {
        setValue(
          'notes',
          notes.map((note) => ({
            ...note,
            position: getNode(note.id)?.position || note.position,
          })),
          options,
        );
      }
    },
    [getNode, getValues, setValue],
  );

  const setValueFn = useCallback(
    (
      path: Path<TAutomationBuilderForm>,
      value: PathValue<TAutomationBuilderForm, Path<TAutomationBuilderForm>>,
      options?: SetValueConfig,
    ) => {
      const nextOptions = {
        shouldDirty: true,
        shouldTouch: true,
        ...options,
      };

      syncPositionUpdates(nextOptions);
      setValue(path, value, nextOptions);
    },
    [setValue, syncPositionUpdates],
  );

  return {
    setAutomationBuilderFormValue: setValueFn,
    syncPositionUpdates,
  };
};
