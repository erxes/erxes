import { AutomationNodesType, NodeData } from '@/automations/types';
import { Node, useReactFlow } from '@xyflow/react';

import { splitAutomationNodeType } from 'ui-modules';
import { toast } from 'erxes-ui';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const useCustomTriggerContent = (activeNode: NodeData) => {
  const { t } = useTranslation('automations');
  const { setAutomationBuilderFormValue } = useAutomationFormController();
  const { setQueryParams, toggleSidebar: toggleSideBarOpen } = useAutomation();
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
      title: t('sidebar-trigger-configuration-added'),
      variant: 'success',
    });
  };

  const onSaveTriggerConfig = (formConfig: any) => {
    // A plugin's form knows only its own fields; re-enrollment is set beside it.
    const { reEnrollment, reEnrollmentRules } = activeTrigger?.config || {};
    const config = { ...formConfig, reEnrollment, reEnrollmentRules };

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
