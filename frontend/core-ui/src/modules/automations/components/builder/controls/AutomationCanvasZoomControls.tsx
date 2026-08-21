import { AutomationCanvasControlButton } from '@/automations/components/builder/controls/AutomationCanvasControlButton';
import { useAutomationCanvasZoom } from '@/automations/components/builder/hooks/useAutomationCanvasZoom';
import { CANVAS_MAX_ZOOM, CANVAS_MIN_ZOOM } from '@/automations/constants';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import { Button, Popover, Slider } from 'erxes-ui';

export const AutomationCanvasZoomControls = () => {
  const { zoomPercent, onZoomIn, onZoomOut, onZoomTo } =
    useAutomationCanvasZoom();

  return (
    <>
      <AutomationCanvasControlButton label="Zoom out" onClick={onZoomOut}>
        <IconMinus />
      </AutomationCanvasControlButton>

      <Popover>
        <Popover.Trigger asChild>
          <Button
            type="button"
            variant="ghost"
            title="Zoom level"
            className="h-7 min-w-12 rounded px-1.5 text-xs font-medium text-foreground tabular-nums hover:bg-accent"
          >
            {zoomPercent}%
          </Button>
        </Popover.Trigger>
        <Popover.Content side="top" align="center" className="w-40">
          <Slider
            aria-label="Zoom level"
            value={[zoomPercent]}
            onValueChange={([value]) => onZoomTo(value)}
            min={CANVAS_MIN_ZOOM * 100}
            max={CANVAS_MAX_ZOOM * 100}
            step={1}
          />
        </Popover.Content>
      </Popover>

      <AutomationCanvasControlButton label="Zoom in" onClick={onZoomIn}>
        <IconPlus />
      </AutomationCanvasControlButton>
    </>
  );
};
