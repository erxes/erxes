import { useSetAtom } from 'jotai';
import {
  KeyboardEvent,
  PointerEvent,
  RefObject,
  useEffect,
  useRef,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  KB_SIDEBAR_MAX_WIDTH,
  KB_SIDEBAR_MIN_WIDTH,
  kbSidebarResizingAtom,
} from '@/knowledgebase/sidebar/states/kbSidebarWidthState';

const KEYBOARD_STEP = 16;

const clamp = (value: number) =>
  Math.round(
    Math.min(KB_SIDEBAR_MAX_WIDTH, Math.max(KB_SIDEBAR_MIN_WIDTH, value)),
  );

export const KbResizeHandle = ({
  panelRef,
  onResize,
  onReset,
}: {
  panelRef: RefObject<HTMLElement | null>;
  onResize: (width: number) => void;
  onReset: () => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });
  const setResizing = useSetAtom(kbSidebarResizingAtom);
  const drag = useRef<{ startX: number; startWidth: number } | null>(null);
  const label = t('resize-sidebar', 'Resize sidebar');

  useEffect(() => () => setResizing(false), [setResizing]);

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    const panel = panelRef.current;

    if (event.button !== 0 || !panel) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { startX: event.clientX, startWidth: panel.offsetWidth };
    setResizing(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!drag.current) return;

    const { startX, startWidth } = drag.current;

    onResize(clamp(startWidth + event.clientX - startX));
  };

  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (!drag.current) return;

    drag.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setResizing(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const panel = panelRef.current;

    if (!panel || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) {
      return;
    }

    event.preventDefault();

    const step = event.key === 'ArrowRight' ? KEYBOARD_STEP : -KEYBOARD_STEP;

    onResize(clamp(panel.offsetWidth + step));
  };

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="absolute inset-y-0 right-0 z-30 w-2 outline-none group/resize cursor-col-resize touch-none"
      onDoubleClick={onReset}
      onKeyDown={handleKeyDown}
      onPointerCancel={handlePointerUp}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <span className="absolute inset-y-0 right-0 w-0.5 bg-transparent transition-colors duration-150 group-hover/resize:bg-primary/40 group-focus-visible/resize:bg-primary group-active/resize:bg-primary" />
    </button>
  );
};
