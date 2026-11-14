import { useCustomTriggerContent } from '@/automations/components/builder/sidebar/hooks/useCustomTriggerContent';
import { AutomationNodeType, NodeData } from '@/automations/types';
import { useCallback, useMemo, useRef } from 'react';

/**
 * A plugin's trigger form: the plugin draws it and saves through the given
 * handler; the sidebar's save button submits it through a ref.
 */
export const useCustomRemoteTriggerContent = (activeNode: NodeData) => {
  const formRef = useRef<{ submit: () => void }>(null);
  const { pluginName, moduleName, activeTrigger, onSaveTriggerConfig } =
    useCustomTriggerContent(activeNode);

  const handleSave = useCallback(() => {
    try {
      formRef.current?.submit();
    } catch (error) {
      console.error('Error submitting trigger form:', error);
    }
  }, []);

  const pluginProps = useMemo(
    () => ({
      formRef,
      componentType: 'triggerForm' as const,
      activeTrigger,
      onSaveTriggerConfig,
    }),
    [activeTrigger, onSaveTriggerConfig],
  );

  return {
    pluginName,
    moduleName,
    pluginProps,
    handleSave,
    triggerType: activeNode?.type || AutomationNodeType.Trigger,
  };
};
