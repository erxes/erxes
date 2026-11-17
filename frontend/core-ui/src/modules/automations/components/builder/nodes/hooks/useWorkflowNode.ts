import { useConvertSelectionToWorkflow } from '@/automations/components/builder/hooks/useConvertSelectionToWorkflow';
import { useWorkflowTemplates } from '@/automations/components/builder/hooks/useWorkflowTemplates';
import { useNodeDropDownActions } from '@/automations/components/builder/nodes/hooks/useNodeDropDownActions';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useWorkflowNodeContext } from '@/automations/context/WorkflowNodeProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { NodeData, WorkflowNodeData } from '@/automations/types';
import { usePagePanel } from '@/side-panel/hooks/usePagePanel';
import { useCallback, useState } from 'react';

/**
 * A workflow node's menu: open it in the editor, edit its name, turn it back
 * into plain steps, save it as a template, or remove it with or without its
 * steps. A workflow borrowed from another automation only opens and edits.
 */
export const useWorkflowNode = (
  id: string,
  data: NodeData & WorkflowNodeData,
) => {
  const dropdown = useNodeDropDownActions(id, data.nodeType);
  const { unconvertWorkflow } = useConvertSelectionToWorkflow();
  const { saveAsTemplate } = useWorkflowTemplates();
  const { setEditingWorkflowId } = useAutomation();
  const { workflows } = useAutomationNodes();
  const { setOpenDialog, setOpenRemoveAlert } = dropdown;

  const hasMemberActions = !!(workflows || []).find(
    (workflow) => workflow.id === id,
  )?.actions?.length;

  const openEditor = useCallback(
    () => setEditingWorkflowId(id),
    [setEditingWorkflowId, id],
  );
  const openEdit = useCallback(() => setOpenDialog(true), [setOpenDialog]);
  const closeEdit = useCallback(() => setOpenDialog(false), [setOpenDialog]);
  const requestRemove = useCallback(
    () => setOpenRemoveAlert(true),
    [setOpenRemoveAlert],
  );
  const convertBack = useCallback(
    () => unconvertWorkflow(id),
    [unconvertWorkflow, id],
  );
  const saveTemplate = useCallback(
    () => saveAsTemplate(id),
    [saveAsTemplate, id],
  );

  // Removing the node but keeping its steps on the canvas
  const unconvertAndRemove = useCallback(() => {
    unconvertWorkflow(id);
    setOpenRemoveAlert(false);
  }, [unconvertWorkflow, id, setOpenRemoveAlert]);

  return {
    ...dropdown,
    isBorrowed: !!data.automationId,
    canConvertBack: !data.automationId && hasMemberActions,
    isVertical: data.flowDirection === 'vertical',
    openEditor,
    openEdit,
    closeEdit,
    requestRemove,
    convertBack,
    saveTemplate,
    unconvertAndRemove,
  };
};

/** The sheet that maps a borrowed workflow's steps, opened from the node. */
export const useWorkflowActionSelectorSheet = () => {
  const { workflowId } = useWorkflowNodeContext();
  const [open, setOpen] = useState(false);
  const pagePanel = usePagePanel({
    maxWidth: 1200,
    defaultWidth: 900,
    name: `automations/workflow/${workflowId}`,
    open,
    onOpenChange: setOpen,
  });

  return { open, pagePanel };
};
