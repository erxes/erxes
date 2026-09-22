import { AutomationCanvasDuplicateAction } from '@/automations/components/builder/controls/AutomationCanvasDuplicateAction';
import { AutomationCanvasLockAction } from '@/automations/components/builder/controls/AutomationCanvasLockAction';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { Separator } from 'erxes-ui';

export const AutomationCanvasRecordActions = () => {
  const { detail } = useAutomation();

  if (!detail?._id) {
    return null;
  }

  return (
    <>
      <Separator orientation="vertical" className="h-5" />
      <AutomationCanvasDuplicateAction />
      <AutomationCanvasLockAction />
    </>
  );
};
