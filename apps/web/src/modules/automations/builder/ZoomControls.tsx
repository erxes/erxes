import { IconFocusCentered, IconMinus, IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { MAX_ZOOM, MIN_ZOOM } from './useCanvasView';

/** The canvas's zoom: out, back to 100%, in, and fit the whole flow. */
export const ZoomControls = ({
  zoom,
  onZoom,
  onFit,
}: {
  zoom: number;
  onZoom: (zoom: number) => void;
  onFit: () => void;
}) => {
  const { t } = useTranslation('automations');
  const step = (delta: number) => onZoom(Math.round((zoom + delta) * 10) / 10);

  return (
    <div className="absolute right-4 bottom-4 z-20 flex items-center gap-0.5 rounded-lg border bg-background p-1 shadow-sm">
      <Button
        size="icon"
        variant="ghost"
        className="size-7"
        aria-label={t('zoom-out', 'Zoom out')}
        disabled={zoom <= MIN_ZOOM}
        onClick={() => step(-0.1)}
      >
        <IconMinus />
      </Button>
      <button
        type="button"
        className="w-11 text-center text-xs tabular-nums text-muted-foreground hover:text-foreground"
        title={t('zoom-reset', 'Back to 100%')}
        onClick={() => onZoom(1)}
      >
        {Math.round(zoom * 100)}%
      </button>
      <Button
        size="icon"
        variant="ghost"
        className="size-7"
        aria-label={t('zoom-in', 'Zoom in')}
        disabled={zoom >= MAX_ZOOM}
        onClick={() => step(0.1)}
      >
        <IconPlus />
      </Button>
      <span className="mx-0.5 h-4 w-px bg-border" />
      <Button
        size="icon"
        variant="ghost"
        className="size-7"
        aria-label={t('zoom-fit', 'Fit to screen')}
        title={t('zoom-fit', 'Fit to screen')}
        onClick={onFit}
      >
        <IconFocusCentered />
      </Button>
    </div>
  );
};
