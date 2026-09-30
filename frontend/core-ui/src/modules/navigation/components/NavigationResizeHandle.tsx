import { navigationResizingState } from '@/navigation/states/navigationPanelState';
import { cn } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import {
  KeyboardEvent,
  PointerEvent,
  RefObject,
  useEffect,
  useRef,
} from 'react';

const KEYBOARD_STEP = 16;

const clamp = (value: number, min: number, max: number) =>
  Math.round(Math.min(max, Math.max(min, value)));

export const NavigationResizeHandle = ({
  label,
  panelRef,
  min,
  max,
  onResize,
  onReset,
  className,
}: {
  label: string;
  panelRef: RefObject<HTMLElement | null>;
  min: number;
  max: number;
  onResize: (width: number) => void;
  onReset: () => void;
  className?: string;
}) => {
  const setResizing = useSetAtom(navigationResizingState);
  const drag = useRef<{ startX: number; startWidth: number } | null>(null);

  useEffect(() => () => setResizing(false), [setResizing]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const panel = panelRef.current;

    if (event.button !== 0 || !panel) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { startX: event.clientX, startWidth: panel.offsetWidth };
    setResizing(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) {
      return;
    }

    const { startX, startWidth } = drag.current;

    onResize(clamp(startWidth + event.clientX - startX, min, max));
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) {
      return;
    }

    drag.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setResizing(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const panel = panelRef.current;

    if (!panel || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) {
      return;
    }

    event.preventDefault();

    const step = event.key === 'ArrowRight' ? KEYBOARD_STEP : -KEYBOARD_STEP;

    onResize(clamp(panel.offsetWidth + step, min, max));
  };

  return (
    <div
      role="separator"
      aria-label={label}
      aria-orientation="vertical"
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      title={label}
      className={cn(
        'group/resize absolute inset-y-0 right-0 z-30 w-2 cursor-col-resize touch-none outline-none',
        className,
      )}
      onDoubleClick={onReset}
      onKeyDown={handleKeyDown}
      onPointerCancel={handlePointerUp}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <span className="absolute inset-y-0 right-0 w-0.5 bg-transparent transition-colors duration-150 group-hover/resize:bg-primary/40 group-focus-visible/resize:bg-primary group-active/resize:bg-primary" />
    </div>
  );
};
