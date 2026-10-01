import { NodeData } from '@/automations/types';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { useFormContext, useWatch } from 'react-hook-form';

// Whether a record starts this trigger every time it crosses, or only once.
export const useSegmentMembershipOnce = (activeNode: NodeData) => {
  const { control, setValue } = useFormContext<TAutomationBuilderForm>();
  const path: `triggers.${number}.config` = `triggers.${activeNode.nodeIndex}.config`;
  const config = useWatch({ control, name: path });

  return {
    once: !!config?.once,
    setOnce: (once: boolean) =>
      setValue(path, { ...config, once }, { shouldDirty: true }),
  };
};
