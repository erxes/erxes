import { BroadcastWorkflowEditor } from '@/broadcast/components/workflow/components/BroadcastWorkflowEditor';
import { useBroadcastWorkflowPreview } from '@/broadcast/hooks/useBroadcastWorkflowPreview';
import { useTranslation } from 'react-i18next';

/**
 * The flow is drawn here rather than on a separate page, so a campaign can be
 * created and made live in one pass. Edits land in the broadcast form and
 * travel with the create mutation, which is what gives the campaign's
 * automation its actions.
 */
export const BroadcastWorkflowPreview = () => {
  const { t } = useTranslation('broadcasts');
  const { value, handleChange } = useBroadcastWorkflowPreview();

  return (
    <BroadcastWorkflowEditor
      value={value}
      startLabel={t('workflow.start-customer')}
      onChange={handleChange}
    />
  );
};
