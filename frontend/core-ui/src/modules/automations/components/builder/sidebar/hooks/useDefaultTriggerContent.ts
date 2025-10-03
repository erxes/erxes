import { TAutomationBuilderForm } from '@/automations/utils/AutomationFormDefinitions';
import { useFormContext, useWatch } from 'react-hook-form';
import { NodeData } from '@/automations/types';

export const useDefaultTriggerContent = ({
  activeNode,
}: {
  activeNode: NodeData;
}) => {
  const { control, getValues, setValue } =
    useFormContext<TAutomationBuilderForm>();
  const contentId = useWatch({
    control,
    name: `triggers.${activeNode.nodeIndex}`,
  })?.config?.contentId;

  const handleCallback = (contentId: string) => {
    const triggers = getValues('triggers');
    const updatedTriggers = triggers.map((trigger) =>
      trigger.id === activeNode.id
        ? { ...trigger, config: { ...(trigger?.config || {}), contentId } }
        : trigger,
    );
    setValue('triggers', updatedTriggers);
  };
  return {
    contentId,
    handleCallback,
  };
};
