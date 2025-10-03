import { useAutomationTrigger } from '@/automations/components/builder/hooks/useAutomationTrigger';
import { IActionProps, SegmentForm } from 'ui-modules';

export const Branches = ({ currentAction, handleSave }: IActionProps) => {
  const { trigger } = useAutomationTrigger(currentAction.id);

  return (
    <div className="w-[650px] flex flex-col max-h-full">
      <SegmentForm
        contentType={trigger?.type || ''}
        segmentId={currentAction?.config?.contentId}
        callback={(contentId) => handleSave({ contentId })}
        isTemporary
      />
    </div>
  );
};
