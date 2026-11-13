import {
  type DragEvent,
  type PointerEvent,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  DASHBOARD_GRID_COLUMNS,
  DASHBOARD_GRID_GAP,
  DASHBOARD_ROW_HEIGHT,
} from '../constants/dashboardGrid';
import { useDashboard } from '../context/DashboardProvider';
import type {
  TDashboardItem,
  TDashboardTile,
  TDashboardWidgetDefinition,
  TResizeAxis,
} from '../types/dashboardTypes';
import { byPosition, clamp, compactLayout, fitToWidget, placeItem } from '../utils/dashboardLayout';

const DROP_PREVIEW_ID = '__drop-preview__';

/** Pixels per grid column and row (gap included) at the grid's width. */
interface GridSteps {
  column: number;
  row: number;
}

type Cell = Pick<TDashboardItem, 'x' | 'y'>;

const gridSteps = (width: number): GridSteps => ({
  column:
    (width - DASHBOARD_GRID_GAP * (DASHBOARD_GRID_COLUMNS - 1)) / DASHBOARD_GRID_COLUMNS +
    DASHBOARD_GRID_GAP,
  row: DASHBOARD_ROW_HEIGHT + DASHBOARD_GRID_GAP,
});

/** A catalog widget at its default size, fitted to its limits. */
const dropSizeOf = (widget: TDashboardWidgetDefinition) =>
  fitToWidget(
    { id: DROP_PREVIEW_ID, type: widget.type, x: 0, y: 0, ...widget.defaultSize },
    widget,
  );

/** The cell under the pointer where a tile of `size` would start. */
const cellAt = (event: DragEvent, rect: DOMRect, size: TDashboardItem, steps: GridSteps) => ({
  x: clamp(
    Math.floor((event.clientX - rect.left) / steps.column),
    0,
    DASHBOARD_GRID_COLUMNS - size.w,
  ),
  y: Math.max(0, Math.floor((event.clientY - rect.top) / steps.row)),
});

/**
 * Moves or resizes one tile while the pointer is down. Every step is measured
 * from where the gesture started, not cumulated.
 */
const usePointerGesture = (layout: TDashboardItem[], steps: GridSteps) => {
  const { isEditing, setDraftItems } = useDashboard();
  const [activeId, setActiveId] = useState<string | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => () => stopRef.current?.(), []);

  const begin = (
    event: PointerEvent,
    item: TDashboardItem,
    toRect: (columns: number, rows: number) => Partial<TDashboardItem>,
  ) => {
    if (event.button !== 0 || !isEditing) return;

    event.preventDefault();
    stopRef.current?.();

    const base = layout;
    const startX = event.clientX;
    const startY = event.clientY;

    const onMove = (moveEvent: globalThis.PointerEvent) => {
      const columns = Math.round((moveEvent.clientX - startX) / steps.column);
      const rows = Math.round((moveEvent.clientY - startY) / steps.row);

      setDraftItems(placeItem(base, item.id, toRect(columns, rows)));
    };

    const stop = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
      stopRef.current = null;
      setActiveId(null);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    stopRef.current = stop;
    setActiveId(item.id);
  };

  return { activeId, begin };
};

/**
 * A catalog widget dragged over the grid: the other tiles make room where it
 * would land. Only catalog cards drop here; files or text dragged in are refused.
 */
const useCatalogDrop = (
  containerRef: RefObject<HTMLElement | null>,
  layout: TDashboardItem[],
  steps: GridSteps,
) => {
  const { isEditing, addWidget, draggingWidget, setDraggingWidget } = useDashboard();
  const [dropAt, setDropAt] = useState<Cell | null>(null);
  const [dragged, setDragged] = useState(draggingWidget);

  // A drag that ends outside the grid leaves no preview behind.
  if (dragged !== draggingWidget) {
    setDragged(draggingWidget);

    if (!draggingWidget) setDropAt(null);
  }

  const dropSize = useMemo(
    () => (draggingWidget ? dropSizeOf(draggingWidget) : null),
    [draggingWidget],
  );

  const shown = useMemo(
    () =>
      dropAt && dropSize
        ? compactLayout([...layout, { ...dropSize, ...dropAt }], DROP_PREVIEW_ID)
        : layout,
    [layout, dropAt, dropSize],
  );

  const dropPreview = shown.find(({ id }) => id === DROP_PREVIEW_ID) ?? null;

  const dropHandlers = {
    onDragOver: (event: DragEvent) => {
      if (!isEditing || !draggingWidget) return;

      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';

      const rect = containerRef.current?.getBoundingClientRect();
      const cell = rect && dropSize ? cellAt(event, rect, dropSize, steps) : null;

      setDropAt((current) =>
        cell && current?.x === cell.x && current.y === cell.y ? current : cell,
      );
    },
    onDragLeave: (event: DragEvent) => {
      const to = event.relatedTarget;

      if (!(to instanceof Node && containerRef.current?.contains(to))) setDropAt(null);
    },
    onDrop: (event: DragEvent) => {
      event.preventDefault();

      if (draggingWidget && dropPreview) {
        addWidget(draggingWidget, { x: dropPreview.x, y: dropPreview.y });
      }

      setDropAt(null);
      setDraggingWidget(null);
    },
  };

  return { shown, dropPreview, dropHandlers };
};

/**
 * Tiles in grid positions and the pointer handling that moves, resizes and
 * drops them while editing. Positions snap to grid cells as the pointer moves.
 */
export const useDashboardGrid = (containerRef: RefObject<HTMLElement | null>, width: number) => {
  const { items, widgets } = useDashboard();
  const steps = gridSteps(width);

  // Saved sizes fitted to each widget's limits, compacted as the grid shows them.
  const layout = useMemo(
    () =>
      compactLayout(
        items.flatMap((item) => {
          const widget = widgets.byType.get(item.type);

          return widget ? [fitToWidget(item, widget)] : [];
        }),
      ),
    [items, widgets.byType],
  );

  const { activeId, begin } = usePointerGesture(layout, steps);
  const { shown, dropPreview, dropHandlers } = useCatalogDrop(containerRef, layout, steps);

  const tiles: TDashboardTile[] = shown
    .filter(({ id }) => id !== DROP_PREVIEW_ID)
    .toSorted(byPosition)
    .flatMap((item) => {
      const widget = widgets.byType.get(item.type);

      return widget ? [{ item, widget }] : [];
    });

  const onMoveStart = (event: PointerEvent, item: TDashboardItem) =>
    begin(event, item, (columns, rows) => ({
      x: clamp(item.x + columns, 0, DASHBOARD_GRID_COLUMNS - item.w),
      y: Math.max(0, item.y + rows),
    }));

  const onResizeStart = (event: PointerEvent, item: TDashboardItem, axis: TResizeAxis) => {
    event.stopPropagation();

    const widget = widgets.byType.get(item.type);

    if (!widget) return;

    const maxW = Math.min(
      widget.maxSize?.w ?? DASHBOARD_GRID_COLUMNS,
      DASHBOARD_GRID_COLUMNS - item.x,
    );

    const maxH = widget.maxSize?.h ?? Infinity;

    begin(event, item, (columns, rows) => ({
      w: axis === 's' ? item.w : clamp(item.w + columns, Math.min(widget.minSize.w, maxW), maxW),
      h: axis === 'e' ? item.h : clamp(item.h + rows, widget.minSize.h, maxH),
    }));
  };

  return { tiles, dropPreview, activeId, onMoveStart, onResizeStart, dropHandlers };
};
