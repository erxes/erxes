import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { toggleAutomationBuilderOpenSidebar } from '@/automations/states/automationState';
import { NodeData } from '@/automations/types';
import { toast } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useCallback, useRef } from 'react';

export const useCoreCustomTriggerContent = (activeNode: NodeData) => {
  const formRef = useRef<{ submit: () => void }>(null);
  const toggleSideBarOpen = useSetAtom(toggleAutomationBuilderOpenSidebar);
  const { setQueryParams } = useAutomation();
  const { setAutomationBuilderFormValue } = useAutomationFormController();
  const handleSave = useCallback(
    (config: any) => {
      // TODO: Implement core trigger configuration save logic
      setAutomationBuilderFormValue(
        `triggers.${activeNode.nodeIndex}.config`,
        config,
      );
      setQueryParams({ activeNodeId: null });
      toggleSideBarOpen();
      toast({
        title: 'Action configuration added successfully.',
      });
    },
    [activeNode?.type],
  );
  return {
    handleSave,
    formRef,
  };
};
