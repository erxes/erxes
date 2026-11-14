import { type PointerEvent as ReactPointerEvent, type RefObject, useRef } from 'react';
import { z } from 'zod';
import { storedFamily } from 'erxes-ui/lib/stored';

export const APP_LAYOUT_DEFAULT_WIDTH = 240;
const APP_LAYOUT_MIN_WIDTH = 180;
const APP_LAYOUT_MAX_WIDTH = 480;
const APP_LAYOUT_KEYBOARD_STEP = 16;

/** Whether each app layout's sidebar is open, per layout id. */
export const appLayoutOpenState = storedFamily({
  key: 'erxes:layout:open',
  schema: z.boolean(),
  initial: true,
});

/** Each app layout's dragged sidebar width; null is the default width. */
export const appLayoutWidthState = storedFamily({
  key: 'erxes:layout:width',
  schema: z.number().min(APP_LAYOUT_MIN_WIDTH).max(APP_LAYOUT_MAX_WIDTH).nullable(),
  initial: null,
});

/** Keeps a resized pane within its configured width limits. */
const clampWidth = (value: number) =>
  Math.round(Math.min(APP_LAYOUT_MAX_WIDTH, Math.max(APP_LAYOUT_MIN_WIDTH, value)));

/** Resizes the application sidebar with pointer capture or keyboard steps. */
export const AppLayoutResizeHandle = ({
  panelRef,
  onResize,
  onReset,
  onResizingChange,
}: {
  panelRef: RefObject<HTMLElement | null>;
  onResize: (width: number) => void;
  onReset: () => void;
  onResizingChange: (resizing: boolean) => void;
}) => {
  const drag = useRef<{ startX: number; startWidth: number } | null>(null);

  /** Ends the captured pointer drag and restores the sidebar resizing state. */
  const stopDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag.current) {
      return;
    }

    drag.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    onResizingChange(false);
  };

  return (
    <button
      type="button"
      aria-label="Resize sidebar"
      title="Resize sidebar"
      className="group/resize absolute inset-y-0 right-0 z-30 w-2 cursor-col-resize touch-none outline-none"
      onDoubleClick={onReset}
      onKeyDown={(event) => {
        const panel = panelRef.current;

        if (!panel || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) {
          return;
        }

        event.preventDefault();
        onResize(
          clampWidth(
            panel.offsetWidth +
              (event.key === 'ArrowRight' ? APP_LAYOUT_KEYBOARD_STEP : -APP_LAYOUT_KEYBOARD_STEP),
          ),
        );
      }}
      onPointerCancel={stopDrag}
      onPointerDown={(event) => {
        const panel = panelRef.current;

        if (event.button !== 0 || !panel) {
          return;
        }

        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = { startX: event.clientX, startWidth: panel.offsetWidth };
        onResizingChange(true);
      }}
      onPointerMove={(event) => {
        if (!drag.current) {
          return;
        }

        const { startX, startWidth } = drag.current;

        onResize(clampWidth(startWidth + event.clientX - startX));
      }}
      onPointerUp={stopDrag}
    >
      <span className="absolute inset-y-0 right-0 w-0.5 bg-transparent transition-colors duration-150 group-hover/resize:bg-primary/40 group-focus-visible/resize:bg-primary group-active/resize:bg-primary" />
    </button>
  );
};
