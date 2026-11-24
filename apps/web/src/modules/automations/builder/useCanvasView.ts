import {
  type PointerEvent,
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

export const MIN_ZOOM = 0.3;
export const MAX_ZOOM = 1.5;

const TOP_GAP = 32;
const DRAG_START = 4;
const INTERACTIVE = 'button, a, input, textarea, select, [contenteditable="true"]';

const clampZoom = (zoom: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));

type Point = { x: number; y: number };

type Pending =
  | { kind: 'point'; at: Point; flow: Point }
  | { kind: 'frame'; vertical: 'top' | 'center' };

const offsetIn = (box: HTMLElement, flow: HTMLElement) => {
  const outer = box.getBoundingClientRect();
  const inner = flow.getBoundingClientRect();

  return { x: inner.left - outer.left, y: inner.top - outer.top, inner };
};

/** The zoom that shows the whole flow in the canvas, at most 100%. */
const fitZoom = (box: HTMLElement, flow: HTMLElement, zoom: number) => {
  const { width, height } = flow.getBoundingClientRect();
  const across = box.clientWidth / (width / zoom + 80);
  const down = box.clientHeight / (height / zoom + 64);

  return clampZoom(Math.floor(Math.min(1, across, down) * 20) / 20);
};

/** Moves the camera so the pending point stays put, or frames the flow. */
const applyPending = (box: HTMLElement, flow: HTMLElement, move: Pending, zoom: number) => {
  const offset = offsetIn(box, flow);

  if (move.kind === 'point') {
    box.scrollLeft += offset.x - (move.at.x - move.flow.x * zoom);
    box.scrollTop += offset.y - (move.at.y - move.flow.y * zoom);

    return;
  }

  box.scrollLeft += offset.x + offset.inner.width / 2 - box.clientWidth / 2;
  box.scrollTop +=
    move.vertical === 'top' || offset.inner.height > box.clientHeight
      ? offset.y - TOP_GAP
      : offset.y + offset.inner.height / 2 - box.clientHeight / 2;
};

const wheelPixels = (event: WheelEvent, delta: number) =>
  event.deltaMode === 1 ? delta * 16 : delta;

/** Scroll moves the camera; pinch or ⌘/Ctrl + scroll zooms at the pointer. */
const useWheel = (
  box: RefObject<HTMLDivElement | null>,
  zoomBy: (factor: number, at: Point) => void,
) => {
  useEffect(() => {
    const el = box.current;

    if (!el) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();

      if (event.ctrlKey || event.metaKey) {
        const rect = el.getBoundingClientRect();
        const step = Math.max(-50, Math.min(50, wheelPixels(event, event.deltaY)));

        zoomBy(Math.exp(-step * 0.01), {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });

        return;
      }

      el.scrollBy({
        left: wheelPixels(event, event.deltaX),
        top: wheelPixels(event, event.deltaY),
      });
    };

    el.addEventListener('wheel', onWheel, { passive: false });

    return () => el.removeEventListener('wheel', onWheel);
  }, [box, zoomBy]);
};

const REVEAL_GAP = 24;

const overflowBy = (start: number, end: number, from: number, to: number) => {
  if (start < from + REVEAL_GAP) return start - from - REVEAL_GAP;

  if (end > to - REVEAL_GAP) return Math.min(end - to + REVEAL_GAP, start - from - REVEAL_GAP);

  return 0;
};

/** Moves the camera just enough to show the selected card, e.g. when a panel opens over it. */
const revealSelected = (box: HTMLElement) => {
  const card = box.querySelector('[data-selected]');

  if (!card) return;

  const outer = box.getBoundingClientRect();
  const inner = card.getBoundingClientRect();
  const left = overflowBy(inner.left, inner.right, outer.left, outer.right);
  const top = overflowBy(inner.top, inner.bottom, outer.top, outer.bottom);

  if (left || top) box.scrollBy({ left, top, behavior: 'smooth' });
};

/** Keeps the selected card on screen when the selection changes or the canvas narrows. */
const useKeepInView = (box: RefObject<HTMLDivElement | null>, selected: string | null) => {
  useEffect(() => {
    if (box.current && selected) revealSelected(box.current);
  }, [box, selected]);

  useEffect(() => {
    const el = box.current;

    if (!el) return;

    const observer = new ResizeObserver(() => revealSelected(el));

    observer.observe(el);

    return () => observer.disconnect();
  }, [box]);
};

/** Dragging the empty canvas moves the camera; cards, buttons and fields keep their pointer. */
const useDragPan = () => {
  const [panning, setPanning] = useState(false);
  const drag = useRef<Point & { moved: boolean }>(null);
  const dragged = useRef(false);

  const end = () => {
    dragged.current = Boolean(drag.current?.moved);
    drag.current = null;
    setPanning(false);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const { target, currentTarget } = event;

    if (event.button !== 0 || !(target instanceof Element)) return;

    if (!currentTarget.contains(target) || target.closest(INTERACTIVE)) return;

    drag.current = { x: event.clientX, y: event.clientY, moved: false };
    currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = drag.current;

    if (!start) return;

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;

    if (!start.moved && Math.hypot(dx, dy) < DRAG_START) return;

    if (!start.moved) setPanning(true);

    drag.current = { x: event.clientX, y: event.clientY, moved: true };
    event.currentTarget.scrollLeft -= dx;
    event.currentTarget.scrollTop -= dy;
  };

  /** True once, for the click that ends a drag, so moving the camera doesn't also deselect. */
  const wasDrag = () => {
    const was = dragged.current;

    dragged.current = false;

    return was;
  };

  return {
    panning,
    wasDrag,
    handlers: { onPointerDown, onPointerMove, onPointerUp: end, onPointerCancel: end },
  };
};

/** The canvas camera: drag or scroll to move, pinch to zoom; the flow starts centred at the top. */
export const useCanvasView = (selected: string | null) => {
  const box = useRef<HTMLDivElement>(null);
  const flow = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const current = useRef(1);
  const pending = useRef<Pending | null>({ kind: 'frame', vertical: 'top' });

  const zoomTo = useCallback((next: number, at?: Point) => {
    const el = box.current;
    const inner = flow.current;
    const zoomed = clampZoom(next);

    if (!el || !inner || zoomed === current.current) return;

    const point = at ?? { x: el.clientWidth / 2, y: el.clientHeight / 2 };
    const offset = offsetIn(el, inner);

    pending.current = {
      kind: 'point',
      at: point,
      flow: {
        x: (point.x - offset.x) / current.current,
        y: (point.y - offset.y) / current.current,
      },
    };
    current.current = zoomed;
    setZoom(zoomed);
  }, []);

  const zoomBy = useCallback(
    (factor: number, at: Point) => zoomTo(current.current * factor, at),
    [zoomTo],
  );

  const fit = () => {
    if (!box.current || !flow.current) return;

    const zoomed = fitZoom(box.current, flow.current, current.current);
    const frame: Pending = { kind: 'frame', vertical: 'center' };

    if (zoomed === current.current) {
      applyPending(box.current, flow.current, frame, zoomed);

      return;
    }

    pending.current = frame;
    current.current = zoomed;
    setZoom(zoomed);
  };

  useLayoutEffect(() => {
    const move = pending.current;

    pending.current = null;

    if (box.current && flow.current && move) applyPending(box.current, flow.current, move, zoom);
  }, [zoom]);

  useWheel(box, zoomBy);
  useKeepInView(box, selected);

  return { box, flow, zoom, zoomTo, fit, ...useDragPan() };
};
