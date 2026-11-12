import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import type { RecordSidePanelResizeHandleProps } from './recordSidePanelTypes';
import { clampWidth, startResizeDrag } from './resizeDrag';
import { SIDE_PANEL_WIDTH } from './sidePanelPaths';

/** Arrows step 16px (64px with Shift); Home and End jump to the limits. */
const keyWidth = (event: React.KeyboardEvent, width: number, maxWidth: number) => {
  const step = event.shiftKey ? 64 : 16;

  const widths: Record<string, number> = {
    ArrowLeft: width + step,
    ArrowRight: width - step,
    Home: SIDE_PANEL_WIDTH.min,
    End: maxWidth,
  };

  return widths[event.key];
};

/** Keeps embedded reports from swallowing pointer events during a resize. */
const DragShield = () =>
  createPortal(
    <div
      aria-hidden="true"
      data-side-panel-resize-shield
      className="fixed inset-0 z-50 cursor-col-resize touch-none select-none"
    />,
    document.body,
  );

/** Dragging the panel's left edge resizes it; leftwards makes it wider. Arrow keys too. */
export const RecordSidePanelResizeHandle = ({
  width,
  maxWidth,
  onWidthChange,
}: RecordSidePanelResizeHandleProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const [dragging, setDragging] = useState(false);
  const stopResize = useRef<((commit?: boolean) => void) | null>(null);
  const onWidthChangeRef = useRef(onWidthChange);
  const dragMaxWidth = useRef(maxWidth);

  useLayoutEffect(() => {
    onWidthChangeRef.current = onWidthChange;
  });

  useEffect(() => () => stopResize.current?.(false), []);

  // A new limit ends the drag at the width it reached.
  useEffect(() => {
    if (dragMaxWidth.current !== maxWidth) stopResize.current?.();
  }, [maxWidth]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const handle = event.currentTarget;
    const panel = handle.parentElement;
    const view = handle.ownerDocument.defaultView;

    if (event.button !== 0 || !event.isPrimary || !panel || !view) return;
    event.preventDefault();
    stopResize.current?.();
    dragMaxWidth.current = maxWidth;

    stopResize.current = startResizeDrag({
      handle,
      panel,
      view,
      pointerId: event.pointerId,
      startX: event.clientX,
      startWidth: panel.getBoundingClientRect().width || width,
      maxWidth,
      onEnd: (next) => {
        stopResize.current = null;
        setDragging(false);

        if (next !== null) onWidthChangeRef.current(next);
      },
    });
    setDragging(true);
  };

  return (
    <>
      <div
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- a focusable window splitter with a grip inside; <hr> holds no children
        role="separator"
        aria-orientation="vertical"
        aria-label={t('resize', 'Resize side panel')}
        aria-valuemin={SIDE_PANEL_WIDTH.min}
        aria-valuemax={maxWidth}
        aria-valuenow={width}
        tabIndex={0}
        title={t('drag-to-resize', 'Drag to resize')}
        data-resizing={dragging || undefined}
        className="group absolute inset-y-0 -left-2 z-10 flex w-4 cursor-col-resize touch-none items-center justify-center outline-none after:absolute after:inset-y-0 after:w-px after:bg-transparent hover:after:bg-primary/50 focus-visible:after:bg-primary data-[resizing=true]:after:bg-primary"
        onPointerDown={handlePointerDown}
        onKeyDown={(event) => {
          const nextWidth = keyWidth(event, width, maxWidth);

          if (nextWidth === undefined) return;
          event.preventDefault();
          onWidthChange(clampWidth(nextWidth, maxWidth));
        }}
      >
        <span className="relative z-10 h-10 w-1 rounded-full bg-border transition-colors group-hover:bg-primary/60 group-focus-visible:bg-primary group-data-[resizing=true]:bg-primary" />
      </div>
      {dragging && <DragShield />}
    </>
  );
};
