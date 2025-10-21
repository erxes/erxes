import { isCoreAutomationActionType } from '@/automations/components/builder/nodes/actions/coreAutomationActions';
import { TAutomationActionComponent } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { toggleAutomationBuilderOpenSidebar } from '@/automations/states/automationState';
import { AutomationNodesType, NodeData } from '@/automations/types';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { Node, useReactFlow } from '@xyflow/react';
import { toast } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useFormContext, useWatch } from 'react-hook-form';
import { splitAutomationNodeType } from 'ui-modules';

export const useAutomationActionContentSidebar = () => {
  const { queryParams, setQueryParams } = useAutomation();
  const { control } = useFormContext<TAutomationBuilderForm>();
  const { setAutomationBuilderFormValue } = useAutomationFormController();
  const toggleSideBarOpen = useSetAtom(toggleAutomationBuilderOpenSidebar);
  const { getNode, updateNodeData } = useReactFlow<Node<NodeData>>();

  // Watch all actions once
  const actions = useWatch({ control, name: 'actions' }) || [];

  // Find the index of the active node by id
  const currentIndex = actions.findIndex(
    (action) => action.id === queryParams?.activeNodeId,
  );

  // Safely get currentAction, guard against -1
  const currentAction = currentIndex >= 0 ? actions[currentIndex] : null;

  // Pick component from Actions map or fallback to null

  const isCoreActionComponent = isCoreAutomationActionType(
    currentAction?.type || '',
    TAutomationActionComponent.Sidebar,
  );

  const [pluginName, moduleName] = splitAutomationNodeType(
    currentAction?.type || '',
  );

  const onSaveActionConfigCallback = () => {
    setQueryParams({ activeNodeId: null });
    toggleSideBarOpen();
    toast({
      title: 'Action configuration added successfully.',
    });
  };

  const onSaveActionConfig = (config: any) => {
    setAutomationBuilderFormValue(
      `${AutomationNodesType.Actions}.${currentIndex}.config`,
      config,
    );
    if (currentAction) {
      const node = getNode(currentAction.id);
      updateNodeData(currentAction.id, { ...node?.data, config });
    }
    onSaveActionConfigCallback();
  };

  return {
    isCoreActionComponent,
    currentIndex,
    currentAction,
    setQueryParams,
    toggleSideBarOpen,
    onSaveActionConfig,
    pluginName,
    moduleName,
  };
};
