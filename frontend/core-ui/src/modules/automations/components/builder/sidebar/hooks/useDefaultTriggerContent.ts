import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { NodeData } from '@/automations/types';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { useFormContext } from 'react-hook-form';

export const useDefaultTriggerContent = ({
  activeNode,
}: {
  activeNode: NodeData;
}) => {
  const { watch } = useFormContext<TAutomationBuilderForm>();
  const { setAutomationBuilderFormValue } = useAutomationFormController();

  const { config } = watch(`triggers.${activeNode.nodeIndex}`) || {};
  const { contentId } = config || {};

  const handleCallback = (contentId: string) => {
    setAutomationBuilderFormValue(
      `triggers.${activeNode.nodeIndex}.config.contentId`,
      contentId,
    );
  };
  return {
    contentId,
    handleCallback,
  };
};
