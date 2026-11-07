import { DASHBOARD_GRID_COLUMNS } from '@/home/dashboard/constants/dashboardGrid';
import { useDashboard } from '@/home/dashboard/context/DashboardProvider';
import {
  TDashboardItem,
  TDashboardWidgetDefinition,
} from '@/home/dashboard/types/dashboardTypes';
import { useMemo } from 'react';
import { Layout, LayoutItem } from 'react-grid-layout';

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const byPosition = (a: TDashboardItem, b: TDashboardItem) =>
  a.y - b.y || a.x - b.x;

/** Tiles in reading order and the grid layout that sizes them. */
export const useDashboardGridLayout = () => {
  const {
    items,
    widgets,
    isEditing,
    applyPositions,
    addWidget,
    draggingWidget,
    setDraggingWidget,
  } = useDashboard();

  const tiles = useMemo(
    () =>
      [...items].sort(byPosition).flatMap((item) => {
        const widget = widgets.byType.get(item.type);

        return widget
          ? [
              { item, widget } as {
                item: TDashboardItem;
                widget: TDashboardWidgetDefinition;
              },
            ]
          : [];
      }),
    [items, widgets.byType],
  );

  // A widget's minimum wins over an older saved size, so a table never
  // comes back squeezed after its minimum grew.
  const layout: Layout = useMemo(
    () =>
      tiles.map(({ item, widget }): LayoutItem => {
        const maxW = Math.min(
          widget.maxSize?.w ?? DASHBOARD_GRID_COLUMNS,
          DASHBOARD_GRID_COLUMNS,
        );
        const maxH = widget.maxSize?.h ?? Infinity;
        const w = clamp(item.w, widget.minSize.w, maxW);

        return {
          i: item.id,
          x: clamp(item.x, 0, DASHBOARD_GRID_COLUMNS - w),
          y: item.y,
          w,
          h: clamp(item.h, widget.minSize.h, maxH),
          minW: widget.minSize.w,
          minH: widget.minSize.h,
          maxW,
          maxH,
        };
      }),
    [tiles],
  );

  const handleLayoutChange = (next: Layout) => {
    if (!isEditing) {
      return;
    }

    applyPositions(
      new Map(next.map(({ i, x, y, w, h }) => [i, { x, y, w, h }])),
    );
  };

  // Only catalog cards drop here; files or text dragged in are refused
  const dropConfig = {
    enabled: isEditing,
    defaultItem: draggingWidget?.defaultSize ?? { w: 1, h: 1 },
    onDragOver: () =>
      draggingWidget ? { ...draggingWidget.defaultSize } : false,
  };

  const handleDrop = (_layout: Layout, dropped: LayoutItem | undefined) => {
    if (draggingWidget && dropped) {
      addWidget(draggingWidget, { x: dropped.x, y: dropped.y });
    }

    setDraggingWidget(null);
  };

  return { tiles, layout, handleLayoutChange, dropConfig, handleDrop };
};
