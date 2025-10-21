import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { toggleAutomationBuilderOpenSidebar } from '@/automations/states/automationState';
import { NodeData } from '@/automations/types';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { toast } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { splitAutomationNodeType } from 'ui-modules';

export const useCustomTriggerContent = (activeNode: NodeData) => {
  const { watch } = useFormContext<TAutomationBuilderForm>();
  const { setAutomationBuilderFormValue } = useAutomationFormController();
  const { setQueryParams } = useAutomation();
  const toggleSideBarOpen = useSetAtom(toggleAutomationBuilderOpenSidebar);

  const triggers = watch(`triggers`);

  const activeTrigger =
    triggers.find((trigger) => trigger.id === activeNode.id) ||
    (activeNode as any);

  const [pluginName, moduleName] = useMemo(
    () => splitAutomationNodeType(activeNode.type || ''),
    [activeNode.type],
  );

  const onSaveTriggerConfig = (config: any) => {
    setAutomationBuilderFormValue(
      `triggers.${activeNode.nodeIndex}.config`,
      config,
    );
    setQueryParams({ activeNodeId: null });
    toggleSideBarOpen();

    toast({
      title: 'Trigger configuration added successfully.',
    });
  };

  return {
    onSaveTriggerConfig,
    pluginName,
    moduleName,
    activeTrigger,
  };
};
