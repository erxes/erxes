import { AutomationNodesType, NodeData } from '@/automations/types';
import { Node, useReactFlow } from '@xyflow/react';

import { splitAutomationNodeType } from 'ui-modules';
import { toast } from 'erxes-ui';
import { toggleAutomationBuilderOpenSidebar } from '@/automations/states/automationState';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { useMemo } from 'react';
import { useSetAtom } from 'jotai';

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
      variant: 'success',
    });
  };

  const onSaveTriggerConfig = (config: any) => {
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
