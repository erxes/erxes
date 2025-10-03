import { useAutomation } from '@/automations/context/AutomationProvider';
import { toggleAutomationBuilderOpenSidebar } from '@/automations/states/automationState';
import { NodeData } from '@/automations/types';
import { TAutomationBuilderForm } from '@/automations/utils/AutomationFormDefinitions';
import { toast } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { getAutomationTypes } from 'ui-modules';

export const useCustomTriggerContent = (activeNode: NodeData) => {
  const { setValue, watch } = useFormContext<TAutomationBuilderForm>();
  const { setQueryParams } = useAutomation();
  const toggleSideBarOpen = useSetAtom(toggleAutomationBuilderOpenSidebar);

  const triggers = watch(`triggers`);

  const activeTrigger =
    triggers.find((trigger) => trigger.id === activeNode.id) ||
    (activeNode as any);

  const [pluginName, moduleName] = useMemo(
    () => getAutomationTypes(activeNode.type || ''),
    [activeNode.type],
  );

  const onSaveTriggerConfig = (config: any) => {
    setValue(`triggers.${activeNode.nodeIndex}.config`, config);
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
