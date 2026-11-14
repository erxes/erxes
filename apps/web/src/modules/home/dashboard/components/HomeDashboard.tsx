import { IconLayoutDashboard } from '@tabler/icons-react';
import { cn, Empty } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DASHBOARD_GRID_GAP,
  DASHBOARD_ROW_HEIGHT,
  DASHBOARD_STACK_BELOW_WIDTH,
} from '../constants/dashboardGrid';
import { useDashboard } from '../context/DashboardProvider';
import { useContainerWidth } from '../hooks/useContainerWidth';
import { useDashboardGrid } from '../hooks/useDashboardGrid';
import type { TDashboardItem } from '../types/dashboardTypes';
import { DashboardTile } from './DashboardTile';

const tileHeight = (rows: number) => rows * DASHBOARD_ROW_HEIGHT + (rows - 1) * DASHBOARD_GRID_GAP;

/** A tile's place on the grid: its column and row, and how many of each it spans. */
const GridCell = ({
  item: { x, y, w, h },
  className,
  children,
}: {
  item: Pick<TDashboardItem, 'x' | 'y' | 'w' | 'h'>;
  className?: string;
  children?: ReactNode;
}) => (
  <div
    className={cn('col-start-(--x) col-span-(--w) row-start-(--y) row-span-(--h)', className)}
    style={{ '--x': x + 1, '--y': y + 1, '--w': w, '--h': h }}
  >
    {children}
  </div>
);

const HomeDashboardEmptyState = () => {
  const { t } = useTranslation('common', { keyPrefix: 'home.dashboard' });

  return (
    <Empty variant="outline">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconLayoutDashboard />
        </Empty.Media>
        <Empty.Description>{t('empty')}</Empty.Description>
      </Empty.Header>
    </Empty>
  );
};

export const HomeDashboard = () => {
  const { width, containerRef, mounted } = useContainerWidth<HTMLDivElement>();
  const { isEditing } = useDashboard();

  const { tiles, dropPreview, activeId, onMoveStart, onResizeStart, dropHandlers } =
    useDashboardGrid(containerRef, width);

  const isStacked = width < DASHBOARD_STACK_BELOW_WIDTH;

  const renderContent = () => {
    // While editing the empty grid stays, so a widget can be dropped on it
    if (!tiles.length && !isEditing) {
      return <HomeDashboardEmptyState />;
    }

    if (isStacked) {
      return (
        <div className="flex flex-col gap-4">
          {tiles.map(({ item, widget }) => (
            <div
              key={item.id}
              className="h-(--tile-height)"
              style={{ '--tile-height': `${tileHeight(item.h)}px` }}
            >
              <DashboardTile item={item} widget={widget} />
            </div>
          ))}
        </div>
      );
    }

    return (
      <div
        {...(isEditing ? dropHandlers : {})}
        className={cn(
          'grid grid-cols-12 auto-rows-10 gap-4',
          isEditing &&
            'min-h-96 rounded-xl outline-2 outline-offset-8 outline-dashed outline-border',
          activeId && 'select-none',
        )}
      >
        {tiles.map(({ item, widget }) => (
          <GridCell
            key={item.id}
            item={item}
            className={cn('min-w-0', activeId === item.id && 'z-20 opacity-90 shadow-lg')}
          >
            <DashboardTile
              item={item}
              widget={widget}
              handlers={isEditing ? { onMoveStart, onResizeStart } : undefined}
            />
          </GridCell>
        ))}
        {dropPreview && (
          <GridCell
            item={dropPreview}
            className="pointer-events-none rounded-xl border-2 border-dashed border-primary/50 bg-primary/10"
          />
        )}
      </div>
    );
  };

  return <div ref={containerRef}>{mounted && renderContent()}</div>;
};
