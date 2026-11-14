import { SIDE_PANEL_WIDTH } from './sidePanelPaths';

/** Keeps a resized pane within its configured width limits. */
export const clampWidth = (width: number, maxWidth: number) =>
  Math.min(maxWidth, Math.max(SIDE_PANEL_WIDTH.min, width));

type Binding = [EventTarget, string, (event: Event) => void, boolean?];

/** Adds the listeners; the returned function removes them again. */
const listen = (bindings: Binding[]) => {
  bindings.forEach(([target, type, listener, capture]) =>
    target.addEventListener(type, listener, capture),
  );

  return () =>
    bindings.forEach(([target, type, listener, capture]) =>
      target.removeEventListener(type, listener, capture),
    );
};

/** Sets the body's cursor and selection for the drag; the returned function restores them. */
const lockBody = (doc: Document) => {
  const { cursor, userSelect } = doc.body.style;
  doc.body.style.cursor = 'col-resize';
  doc.body.style.userSelect = 'none';

  return () => {
    doc.body.style.cursor = cursor;
    doc.body.style.userSelect = userSelect;
  };
};

/**
 * Follows one pointer dragging a panel's left edge; leftwards makes it wider. Paints the
 * width locally and reports it once, at the end, when it changed. Returns `stop`, which
 * ends the drag (`commit = false` drops the width, e.g. on unmount).
 */
export const startResizeDrag = ({
  handle,
  panel,
  view,
  pointerId,
  startX,
  startWidth,
  maxWidth,
  onEnd,
}: {
  handle: HTMLElement;
  panel: HTMLElement;
  view: Window;
  pointerId: number;
  startX: number;
  startWidth: number;
  maxWidth: number;
  onEnd: (width: number | null) => void;
}) => {
  const doc = view.document;
  let nextWidth = startWidth;
  let frame: number | null = null;
  let stopped = false;

  const paint = () => {
    frame = null;
    panel.style.width = `${nextWidth}px`;
    handle.setAttribute('aria-valuenow', String(nextWidth));
  };

  const stop = (commit = true) => {
    if (stopped) return;
    stopped = true;

    if (frame !== null) view.cancelAnimationFrame(frame);
    unlisten();
    unlock();

    if (handle.hasPointerCapture(pointerId)) handle.releasePointerCapture(pointerId);

    if (commit) paint();
    onEnd(commit && nextWidth !== startWidth ? nextWidth : null);
  };

  const ownPointer = (event: Event) =>
    event instanceof PointerEvent && event.pointerId === pointerId;

  const unlisten = listen([
    [
      doc,
      'pointermove',
      (event) => {
        if (!(event instanceof PointerEvent) || !ownPointer(event)) return;

        // Recover even when the browser never delivered the release event.
        if ((event.buttons & 1) === 0) {
          stop();

          return;
        }

        nextWidth = clampWidth(startWidth + startX - event.clientX, maxWidth);
        frame ??= view.requestAnimationFrame(paint);
      },
      true,
    ],
    [doc, 'pointerup', (event) => ownPointer(event) && stop(), true],
    [doc, 'pointercancel', (event) => ownPointer(event) && stop(), true],
    [handle, 'lostpointercapture', (event) => ownPointer(event) && stop()],
    [doc, 'visibilitychange', () => doc.visibilityState === 'hidden' && stop()],
    [view, 'blur', () => stop()],
    [
      doc,
      'keydown',
      (event) => {
        if (!(event instanceof KeyboardEvent) || event.key !== 'Escape') return;
        // Ends the resize without passing the shortcut on to the record.
        event.preventDefault();
        event.stopPropagation();
        stop();
      },
      true,
    ],
  ]);

  const unlock = lockBody(doc);
  handle.setPointerCapture(pointerId);

  return stop;
};
