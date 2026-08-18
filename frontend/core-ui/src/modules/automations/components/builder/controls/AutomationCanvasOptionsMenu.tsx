import { CANVAS_CONTROL_BUTTON_CLASS } from '@/automations/components/builder/controls/AutomationCanvasControlButton';
import { AutomationCanvasDirectionOptions } from '@/automations/components/builder/controls/AutomationCanvasDirectionOptions';
import { AutomationCanvasDownloadOptions } from '@/automations/components/builder/controls/AutomationCanvasDownloadOptions';
import { AutomationCanvasEdgeTypeOptions } from '@/automations/components/builder/controls/AutomationCanvasEdgeTypeOptions';
import { AutomationCanvasViewOptions } from '@/automations/components/builder/controls/AutomationCanvasViewOptions';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { IconMenu2 } from '@tabler/icons-react';
import { Button, DropdownMenu } from 'erxes-ui';

export const AutomationCanvasOptionsMenu = () => {
  const { isReadOnly } = useAutomation();

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          disabled={isReadOnly}
          type="button"
          variant="ghost"
          size="icon"
          title="Canvas options"
          className={CANVAS_CONTROL_BUTTON_CLASS}
        >
          <IconMenu2 className="size-4" />
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content align="end" side="right" className="w-56">
        <AutomationCanvasViewOptions />
        <DropdownMenu.Separator />
        <AutomationCanvasDirectionOptions />
        <AutomationCanvasEdgeTypeOptions />
        <AutomationCanvasDownloadOptions />
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
