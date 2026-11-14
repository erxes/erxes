import {
  DASHBOARD_TILE_ACTION_CLASS,
  DASHBOARD_TILE_HANDLE_CLASS,
  DashboardTile,
} from '@/home/dashboard/components/DashboardTile';
import {
  DASHBOARD_GRID_COLUMNS,
  DASHBOARD_GRID_GAP,
  DASHBOARD_ROW_HEIGHT,
  DASHBOARD_STACK_BELOW_WIDTH,
} from '@/home/dashboard/constants/dashboardGrid';
import { renderDashboardResizeHandle } from '@/home/dashboard/components/DashboardResizeHandle';
import { useDashboard } from '@/home/dashboard/context/DashboardProvider';
import { useDashboardGridLayout } from '@/home/dashboard/hooks/useDashboardGridLayout';
import { IconLayoutDashboard } from '@tabler/icons-react';
import { cn, Skeleton } from 'erxes-ui';
import { RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GridLayout,
  useContainerWidth,
  verticalCompactor,
} from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';

const tileHeight = (rows: number) =>
  rows * DASHBOARD_ROW_HEIGHT + (rows - 1) * DASHBOARD_GRID_GAP;

const HomeDashboardSkeleton = () => (
  <div className="grid gap-4 lg:grid-cols-2">
    {[0, 1, 2, 3].map((key) => (
      <Skeleton key={key} className="h-56 w-full rounded-xl" />
    ))}
  </div>
);

const HomeDashboardEmptyState = () => {
  const { t } = useTranslation('common', { keyPrefix: 'home.dashboard' });

  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed bg-background px-6 py-12 text-center text-sm text-muted-foreground">
      <IconLayoutDashboard className="size-6" />
      <span>{t('empty')}</span>
    </div>
  );
};

export const HomeDashboard = () => {
  const { width, containerRef, mounted } = useContainerWidth();
  const { loading, isEditing } = useDashboard();
  const { tiles, layout, handleLayoutChange, dropConfig, handleDrop } =
    useDashboardGridLayout();

  const isStacked = width < DASHBOARD_STACK_BELOW_WIDTH;

  const renderContent = () => {
    if (loading) {
      return <HomeDashboardSkeleton />;
    }

    // While editing the empty grid stays, so a widget can be dropped on it
    if (!tiles.length && !isEditing) {
      return <HomeDashboardEmptyState />;
    }

    if (isStacked) {
      return (
        <div className="flex flex-col gap-4">
          {tiles.map(({ item, widget }) => (
            <div key={item.id} style={{ height: tileHeight(item.h) }}>
              <DashboardTile item={item} widget={widget} />
            </div>
          ))}
        </div>
      );
    }

    return (
      <GridLayout
        width={width}
        layout={layout}
        gridConfig={{
          cols: DASHBOARD_GRID_COLUMNS,
          rowHeight: DASHBOARD_ROW_HEIGHT,
          margin: [DASHBOARD_GRID_GAP, DASHBOARD_GRID_GAP],
          containerPadding: [0, 0],
        }}
        dragConfig={{
          enabled: isEditing,
          handle: `.${DASHBOARD_TILE_HANDLE_CLASS}`,
          cancel: `.${DASHBOARD_TILE_ACTION_CLASS}`,
        }}
        resizeConfig={{
          enabled: isEditing,
          // The library draws handles even while disabled
          handles: isEditing ? ['se', 'e', 's'] : [],
          handleComponent: renderDashboardResizeHandle,
        }}
        dropConfig={dropConfig}
        onDrop={handleDrop}
        compactor={verticalCompactor}
        onLayoutChange={handleLayoutChange}
        className={cn(
          isEditing &&
            'min-h-96 rounded-xl outline-2 outline-offset-8 outline-dashed outline-border',
        )}
      >
        {tiles.map(({ item, widget }) => (
          <div key={item.id}>
            <DashboardTile item={item} widget={widget} />
          </div>
        ))}
      </GridLayout>
    );
  };

  // The library types its ref for React 19; React 18 wants a plain RefObject
  return (
    <div ref={containerRef as RefObject<HTMLDivElement>}>
      {mounted && renderContent()}
    </div>
  );
};
