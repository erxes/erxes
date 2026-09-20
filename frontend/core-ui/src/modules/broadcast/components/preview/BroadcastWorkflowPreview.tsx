import {
  BroadcastWorkflowEditor,
  TBroadcastWorkflow,
} from '@/broadcast/components/workflow/components/BroadcastWorkflowEditor';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';

const START_LABEL_BY_TARGET: Record<string, string> = {
  segment: 'Customer',
  tag: 'Customer',
};

/**
 * The flow is drawn here rather than on a separate page, so a campaign can be
 * created and made live in one pass. Edits land in the broadcast form and
 * travel with the create mutation, which is what gives the campaign's
 * automation its actions.
 */
export const BroadcastWorkflowPreview = () => {
  const { setValue, getValues, watch } = useFormContext();
  const targetType = watch('targetType');

  const handleChange = useCallback(
    (workflow: TBroadcastWorkflow) => {
      setValue('workflow', workflow, { shouldDirty: true });
    },
    [setValue],
  );

  return (
    <BroadcastWorkflowEditor
      value={getValues('workflow')}
      startLabel={START_LABEL_BY_TARGET[targetType] || 'Customer'}
      onChange={handleChange}
    />
  );
};
