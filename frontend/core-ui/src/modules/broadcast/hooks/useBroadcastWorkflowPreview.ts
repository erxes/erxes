import { TBroadcastWorkflow } from '@/broadcast/components/workflow/components/BroadcastWorkflowEditor';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';

/** The campaign's flow, read from and written back to the broadcast form. */
export const useBroadcastWorkflowPreview = () => {
  const { setValue, getValues } = useFormContext();

  const handleChange = useCallback(
    (workflow: TBroadcastWorkflow) =>
      setValue('workflow', workflow, { shouldDirty: true }),
    [setValue],
  );

  return { value: getValues('workflow'), handleChange };
};
