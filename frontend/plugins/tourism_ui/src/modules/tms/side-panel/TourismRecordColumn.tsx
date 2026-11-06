import { ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const MIN_WIDTH = 288;
const MAX_WIDTH = 720;
const DEFAULT_WIDTH = 384;
const KEY_STEP = 16;

const clampWidth = (width: number) =>
  Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, width));

export const TourismRecordColumn = ({
  header,
  children,
}: {
  header: ReactNode;
  children: ReactNode;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [dragging, setDragging] = useState(false);
  const stopDrag = useRef<(() => void) | null>(null);

  useEffect(() => () => stopDrag.current?.(), []);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    stopDrag.current?.();

    const doc = event.currentTarget.ownerDocument;
    const startX = event.clientX;
    const startWidth = width;
    const previousCursor = doc.body.style.cursor;
    const previousUserSelect = doc.body.style.userSelect;

    const move = (moveEvent: PointerEvent) =>
      setWidth(clampWidth(startWidth + moveEvent.clientX - startX));
    const stop = () => {
      doc.removeEventListener('pointermove', move);
      doc.removeEventListener('pointerup', stop);
      doc.removeEventListener('pointercancel', stop);
      doc.body.style.cursor = previousCursor;
      doc.body.style.userSelect = previousUserSelect;
      stopDrag.current = null;
      setDragging(false);
    };

    doc.addEventListener('pointermove', move);
    doc.addEventListener('pointerup', stop);
    doc.addEventListener('pointercancel', stop);
    doc.body.style.cursor = 'col-resize';
    doc.body.style.userSelect = 'none';
    stopDrag.current = stop;
    setDragging(true);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? KEY_STEP * 4 : KEY_STEP;
    const widths: Record<string, number> = {
      ArrowLeft: width - step,
      ArrowRight: width + step,
      Home: MIN_WIDTH,
      End: MAX_WIDTH,
    };
    const nextWidth = widths[event.key];

    if (nextWidth === undefined) return;

    event.preventDefault();
    setWidth(clampWidth(nextWidth));
  };

  return (
    <div
      className="relative flex min-h-0 flex-none flex-col border-r bg-background"
      style={{ width }}
    >
      <div className="box-content flex h-9 min-w-0 flex-none items-center gap-2 border-b px-3">
        {header}
      </div>
      {children}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label={t('resize', 'Resize side panel')}
        aria-valuenow={width}
        aria-valuemin={MIN_WIDTH}
        aria-valuemax={MAX_WIDTH}
        tabIndex={0}
        title={t('drag-to-resize', 'Drag to resize')}
        data-resizing={dragging || undefined}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        className="group absolute inset-y-0 -right-2 z-10 flex w-4 cursor-col-resize touch-none items-center justify-center outline-none after:absolute after:inset-y-0 after:w-px after:bg-transparent hover:after:bg-primary/50 focus-visible:after:bg-primary data-[resizing=true]:after:bg-primary"
      >
        <span className="relative z-10 h-10 w-1 rounded-full bg-border transition-colors group-hover:bg-primary/60 group-focus-visible:bg-primary group-data-[resizing=true]:bg-primary" />
      </div>
    </div>
  );
};
