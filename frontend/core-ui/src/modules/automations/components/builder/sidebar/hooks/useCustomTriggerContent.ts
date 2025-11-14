import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { toggleAutomationBuilderOpenSidebar } from '@/automations/states/automationState';
import { AutomationNodesType, NodeData } from '@/automations/types';
import { Node, useReactFlow } from '@xyflow/react';
import { toast } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useMemo } from 'react';
import { splitAutomationNodeType } from 'ui-modules';

export const useCustomTriggerContent = (activeNode: NodeData) => {
  const { setAutomationBuilderFormValue } = useAutomationFormController();
  const { setQueryParams } = useAutomation();
  const toggleSideBarOpen = useSetAtom(toggleAutomationBuilderOpenSidebar);
  const { triggers } = useAutomationNodes();
  const { getNode, updateNodeData } = useReactFlow<Node<NodeData>>();
  const activeTrigger = triggers[activeNode.nodeIndex];

  const [pluginName, moduleName] = useMemo(
    () => splitAutomationNodeType(activeNode.type || ''),
    [activeNode.type],
  );

  const onSaveTriggerConfigCallback = () => {
    setQueryParams({ activeNodeId: null });
    toggleSideBarOpen();
    toast({
      title: 'Trigger configuration added successfully.',
    });
  };

  const onSaveTriggerConfig = (config: any) => {
    console.log({ config, index: activeNode.nodeIndex });
    setAutomationBuilderFormValue(
      `${AutomationNodesType.Triggers}.${activeNode.nodeIndex}.config`,
      config,
    );
    if (activeTrigger) {
      const node = getNode(activeTrigger.id);
      updateNodeData(activeTrigger.id, { ...node?.data, config });
    }
    onSaveTriggerConfigCallback();
  };

  return {
    onSaveTriggerConfig,
    pluginName,
    moduleName,
    activeTrigger,
  };
};
