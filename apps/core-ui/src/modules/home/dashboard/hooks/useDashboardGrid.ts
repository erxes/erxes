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
import type { TDashboardItem, TDashboardTile, TResizeAxis } from '../types/dashboardTypes';
import { byPosition, clamp, compactLayout, fitToWidget, placeItem } from '../utils/dashboardLayout';

const DROP_PREVIEW_ID = '__drop-preview__';

/**
 * Tiles in grid positions and the pointer handling that moves, resizes and
 * drops them while editing (react-grid-layout did this in old core-ui).
 * Positions snap to grid cells as the pointer moves.
 */
export const useDashboardGrid = (containerRef: RefObject<HTMLElement>, width: number) => {
  const { items, widgets, isEditing, setDraftItems, addWidget, draggingWidget, setDraggingWidget } =
    useDashboard();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [dropAt, setDropAt] = useState<Pick<TDashboardItem, 'x' | 'y'> | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => () => stopRef.current?.(), []);

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

  const dropSize = useMemo(
    () =>
      draggingWidget
        ? fitToWidget(
            {
              id: DROP_PREVIEW_ID,
              type: draggingWidget.type,
              x: 0,
              y: 0,
              ...draggingWidget.defaultSize,
            },
            draggingWidget,
          )
        : null,
    [draggingWidget],
  );

  // While a catalog widget hovers, the other tiles make room as they will on drop.
  const shown = useMemo(
    () =>
      dropAt && dropSize
        ? compactLayout([...layout, { ...dropSize, ...dropAt }], DROP_PREVIEW_ID)
        : layout,
    [layout, dropAt, dropSize],
  );

  const tiles: TDashboardTile[] = shown
    .filter(({ id }) => id !== DROP_PREVIEW_ID)
    .toSorted(byPosition)
    .flatMap((item) => {
      const widget = widgets.byType.get(item.type);

      return widget ? [{ item, widget }] : [];
    });

  const dropPreview = shown.find(({ id }) => id === DROP_PREVIEW_ID) ?? null;

  const columnStep =
    (width - DASHBOARD_GRID_GAP * (DASHBOARD_GRID_COLUMNS - 1)) / DASHBOARD_GRID_COLUMNS +
    DASHBOARD_GRID_GAP;

  const rowStep = DASHBOARD_ROW_HEIGHT + DASHBOARD_GRID_GAP;

  const begin = (
    event: PointerEvent,
    item: TDashboardItem,
    toRect: (columns: number, rows: number) => Partial<TDashboardItem>,
  ) => {
    if (event.button !== 0 || !isEditing) {
      return;
    }

    event.preventDefault();
    stopRef.current?.();

    // Every step is measured from where the gesture started, not cumulated.
    const base = layout;
    const startX = event.clientX;
    const startY = event.clientY;

    const onMove = (moveEvent: globalThis.PointerEvent) => {
      const columns = Math.round((moveEvent.clientX - startX) / columnStep);
      const rows = Math.round((moveEvent.clientY - startY) / rowStep);

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

  const onMoveStart = (event: PointerEvent, item: TDashboardItem) =>
    begin(event, item, (columns, rows) => ({
      x: clamp(item.x + columns, 0, DASHBOARD_GRID_COLUMNS - item.w),
      y: Math.max(0, item.y + rows),
    }));

  const onResizeStart = (event: PointerEvent, item: TDashboardItem, axis: TResizeAxis) => {
    event.stopPropagation();

    const widget = widgets.byType.get(item.type);

    if (!widget) {
      return;
    }

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

  // Only catalog cards drop here; files or text dragged in are refused.
  const cellAt = (event: DragEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();

    if (!rect || !dropSize) {
      return null;
    }

    return {
      x: clamp(
        Math.floor((event.clientX - rect.left) / columnStep),
        0,
        DASHBOARD_GRID_COLUMNS - dropSize.w,
      ),
      y: Math.max(0, Math.floor((event.clientY - rect.top) / rowStep)),
    };
  };

  const dropHandlers = {
    onDragOver: (event: DragEvent) => {
      if (!isEditing || !draggingWidget) {
        return;
      }

      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';

      const cell = cellAt(event);

      setDropAt((current) =>
        cell && current?.x === cell.x && current.y === cell.y ? current : cell,
      );
    },
    onDragLeave: (event: DragEvent) => {
      const to = event.relatedTarget;

      if (!(to instanceof Node && containerRef.current?.contains(to))) {
        setDropAt(null);
      }
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

  // A drag that ends outside the grid leaves no preview behind.
  useEffect(() => {
    if (!draggingWidget) {
      setDropAt(null);
    }
  }, [draggingWidget]);

  return { tiles, dropPreview, activeId, onMoveStart, onResizeStart, dropHandlers };
};
