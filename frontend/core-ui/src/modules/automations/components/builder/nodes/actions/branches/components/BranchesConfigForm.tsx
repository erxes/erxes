import { useAutomationTrigger } from '@/automations/components/builder/hooks/useAutomationTrigger';
import { TAutomationActionProps, SegmentForm } from 'ui-modules';

export const BranchesConfigForm = ({
  currentAction,
  handleSave,
}: TAutomationActionProps<{ contentId: string }>) => {
  const { trigger } = useAutomationTrigger(currentAction.id);

  return (
    <div className="w-[650px] h-full">
      <SegmentForm
        contentType={trigger?.type || ''}
        segmentId={currentAction?.config?.contentId}
        callback={(contentId) => handleSave({ contentId })}
        isTemporary
      />
    </div>
  );
};
