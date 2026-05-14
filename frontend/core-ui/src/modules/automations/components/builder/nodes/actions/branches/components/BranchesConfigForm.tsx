import { useAutomationTrigger } from '@/automations/components/builder/hooks/useAutomationTrigger';
import { AutomationSegmentForm } from '@/automations/components/common/AutomationSegmentForm';
import { TAutomationActionProps, SegmentForm } from 'ui-modules';

export const BranchesConfigForm = ({
  currentAction,
  handleSave,
}: TAutomationActionProps<{ contentId: string }>) => {
  const { trigger } = useAutomationTrigger(currentAction.id);

  return (
    <div className="h-full w-full">
      <AutomationSegmentForm
        contentType={trigger?.type || ''}
        segmentId={currentAction?.config?.contentId}
        callback={(contentId) => handleSave({ contentId })}
      />
    </div>
  );
};
