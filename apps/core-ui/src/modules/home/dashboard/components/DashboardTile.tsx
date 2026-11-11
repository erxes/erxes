import { IconGripVertical, IconX } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import type { PointerEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboard } from '../context/DashboardProvider';
import { useDashboardWidgetText } from '../hooks/useDashboardWidgetText';
import type { TDashboardItem, TDashboardWidgetDefinition, TResizeAxis } from '../types/dashboardTypes';
import { DASHBOARD_RESIZE_AXES, DashboardResizeHandle } from './DashboardResizeHandle';
import { DashboardTileErrorBoundary } from './DashboardTileCrashState';

export type TDashboardTileHandlers = {
  onMoveStart: (event: PointerEvent, item: TDashboardItem) => void;
  onResizeStart: (event: PointerEvent, item: TDashboardItem, axis: TResizeAxis) => void;
};

// Pointer presses on the tile's buttons must not start a drag.
const stop = (event: PointerEvent) => event.stopPropagation();

const DashboardTileEditOverlay = ({
  item,
  widget,
  handlers,
}: {
  item: TDashboardItem;
  widget: TDashboardWidgetDefinition;
  handlers: TDashboardTileHandlers;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'home' });
  const { removeItem } = useDashboard();
  const getText = useDashboardWidgetText();

  return (
    <>
      {/* The whole tile drags while editing, so its content can't be clicked */}
      <div
        onPointerDown={(event) => handlers.onMoveStart(event, item)}
        className="absolute inset-0 z-10 cursor-move touch-none rounded-xl bg-background/40 ring-2 ring-primary/40"
      >
        <div className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-background px-1.5 py-1 text-xs font-medium shadow-xs">
          <IconGripVertical className="size-3.5 text-muted-foreground" />
          {getText(widget).label}
        </div>
        <div onPointerDown={stop} className="absolute right-2 top-2 flex items-center gap-1">
          <Button
            variant="secondary"
            size="icon"
            className="text-destructive"
            aria-label={t('dashboard.remove')}
            onClick={() => removeItem(item.id)}
          >
            <IconX />
          </Button>
        </div>
      </div>
      {DASHBOARD_RESIZE_AXES.map((axis) => (
        <DashboardResizeHandle
          key={axis}
          axis={axis}
          onPointerDown={(event) => handlers.onResizeStart(event, item, axis)}
        />
      ))}
    </>
  );
};

export const DashboardTile = ({
  item,
  widget,
  handlers,
}: {
  item: TDashboardItem;
  widget: TDashboardWidgetDefinition;
  // Present while editing on the grid (not in the stacked narrow layout).
  handlers?: TDashboardTileHandlers;
}) => {
  const { Component } = widget;

  return (
    <div className="relative h-full">
      <DashboardTileErrorBoundary>
        <Component />
      </DashboardTileErrorBoundary>
      {handlers && <DashboardTileEditOverlay item={item} widget={widget} handlers={handlers} />}
    </div>
  );
};
