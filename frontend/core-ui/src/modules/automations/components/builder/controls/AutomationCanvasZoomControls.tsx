import { AutomationCanvasControlButton } from '@/automations/components/builder/controls/AutomationCanvasControlButton';
import { useAutomationCanvasZoom } from '@/automations/components/builder/hooks/useAutomationCanvasZoom';
import { CANVAS_MAX_ZOOM, CANVAS_MIN_ZOOM } from '@/automations/constants';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import { Button, Popover, Slider } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const AutomationCanvasZoomControls = () => {
  const { t } = useTranslation('automations');
  const { zoomPercent, onZoomIn, onZoomOut, onZoomTo } =
    useAutomationCanvasZoom();

  return (
    <>
      <AutomationCanvasControlButton
        label={t('controls-zoom-out')}
        onClick={onZoomOut}
      >
        <IconMinus />
      </AutomationCanvasControlButton>

      <Popover>
        <Popover.Trigger asChild>
          <Button
            type="button"
            variant="ghost"
            title={t('controls-zoom-level')}
            className="h-7 min-w-12 rounded px-1.5 text-xs font-medium text-foreground tabular-nums hover:bg-accent"
          >
            {zoomPercent}%
          </Button>
        </Popover.Trigger>
        <Popover.Content side="top" align="center" className="w-40">
          <Slider
            aria-label={t('controls-zoom-level')}
            value={[zoomPercent]}
            onValueChange={([value]) => onZoomTo(value)}
            min={CANVAS_MIN_ZOOM * 100}
            max={CANVAS_MAX_ZOOM * 100}
            step={1}
          />
        </Popover.Content>
      </Popover>

      <AutomationCanvasControlButton
        label={t('controls-zoom-in')}
        onClick={onZoomIn}
      >
        <IconPlus />
      </AutomationCanvasControlButton>
    </>
  );
};
