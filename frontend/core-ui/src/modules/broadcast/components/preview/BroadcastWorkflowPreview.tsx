import {
  BroadcastWorkflowEditor,
  TBroadcastWorkflow,
} from '@/broadcast/components/workflow/components/BroadcastWorkflowEditor';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

/**
 * The flow is drawn here rather than on a separate page, so a campaign can be
 * created and made live in one pass. Edits land in the broadcast form and
 * travel with the create mutation, which is what gives the campaign's
 * automation its actions.
 */
export const BroadcastWorkflowPreview = () => {
  const { t } = useTranslation('broadcasts');
  const { setValue, getValues } = useFormContext();

  const handleChange = useCallback(
    (workflow: TBroadcastWorkflow) => {
      setValue('workflow', workflow, { shouldDirty: true });
    },
    [setValue],
  );

  return (
    <BroadcastWorkflowEditor
      value={getValues('workflow')}
      startLabel={t('workflow.start-customer')}
      onChange={handleChange}
    />
  );
};
