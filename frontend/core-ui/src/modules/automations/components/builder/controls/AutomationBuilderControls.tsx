import { AutomationCanvasOptionsMenu } from '@/automations/components/builder/controls/AutomationCanvasOptionsMenu';
import { AutomationCanvasRecordActions } from '@/automations/components/builder/controls/AutomationCanvasRecordActions';
import { AutomationCanvasViewControls } from '@/automations/components/builder/controls/AutomationCanvasViewControls';
import { AutomationCanvasZoomControls } from '@/automations/components/builder/controls/AutomationCanvasZoomControls';
import { Panel } from '@xyflow/react';
import { Separator } from 'erxes-ui';

export const AutomationBuilderControls = () => {
  return (
    <Panel position="bottom-center" className="pointer-events-auto">
      <div className="flex flex-row items-center gap-0.5 rounded-md border bg-background/95 p-1 shadow-sm backdrop-blur">
        <AutomationCanvasViewControls />

        <Separator orientation="vertical" className="h-5" />

        <AutomationCanvasZoomControls />

        <AutomationCanvasRecordActions />
        <Separator orientation="vertical" className="h-5" />

        <AutomationCanvasOptionsMenu />
      </div>
    </Panel>
  );
};
