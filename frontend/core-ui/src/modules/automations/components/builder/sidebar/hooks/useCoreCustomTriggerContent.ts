import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { NodeData } from '@/automations/types';
import { toast } from 'erxes-ui';
import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export const useCoreCustomTriggerContent = (activeNode: NodeData) => {
  const { t } = useTranslation('automations');
  const formRef = useRef<{ submit: () => void }>(null);
  const { setQueryParams, toggleSidebar: toggleSideBarOpen } = useAutomation();
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
        title: t('sidebar-trigger-configuration-added'),
        variant: 'success',
      });
    },
    [activeNode?.type, t],
  );
  return {
    handleSave,
    formRef,
  };
};
