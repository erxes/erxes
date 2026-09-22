import { useWorkflowEditScope } from '@/automations/context/WorkflowEditScopeProvider';
import { AutomationNodeType } from '@/automations/types';
import {
  EMPTY_NODE_SELECTION,
  TNodeSelection,
} from '@/automations/utils/automationBuilderUtils/nodeSelection';
import { OnSelectionChangeParams, useOnSelectionChange } from '@xyflow/react';
import { useCallback, useState } from 'react';

export const useMarqueeSelection = () => {
  const [selection, setSelection] =
    useState<TNodeSelection>(EMPTY_NODE_SELECTION);
  const workflowEditScope = useWorkflowEditScope();

  const onChange = useCallback(({ nodes }: OnSelectionChangeParams) => {
    const idsOfType = (nodeType: AutomationNodeType) =>
      nodes.filter((node) => node.type === nodeType).map((node) => node.id);

    setSelection({
      actionIds: idsOfType(AutomationNodeType.Action),
      triggerIds: idsOfType(AutomationNodeType.Trigger),
      workflowIds: idsOfType(AutomationNodeType.Workflow),
    });
  }, []);

  useOnSelectionChange({ onChange });

  const selectedIds = [
    ...selection.triggerIds,
    ...selection.actionIds,
    ...selection.workflowIds,
  ];

  return {
    selection,
    selectedIds,
    clearSelection: () => setSelection(EMPTY_NODE_SELECTION),
    // Converting inside a workflow would nest workflows, which is unsupported
    canConvertToWorkflow:
      !workflowEditScope &&
      selection.actionIds.length >= 2 &&
      !selection.triggerIds.length &&
      !selection.workflowIds.length,
  };
};
