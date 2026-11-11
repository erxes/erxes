import { IconLayoutDashboard } from '@tabler/icons-react';
import { cn } from 'erxes-ui';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DASHBOARD_GRID_COLUMNS,
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

const GRID_STYLE: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: `repeat(${DASHBOARD_GRID_COLUMNS}, minmax(0, 1fr))`,
  gridAutoRows: `${DASHBOARD_ROW_HEIGHT}px`,
  gap: `${DASHBOARD_GRID_GAP}px`,
};

const cellStyle = ({ x, y, w, h }: Pick<TDashboardItem, 'x' | 'y' | 'w' | 'h'>): CSSProperties => ({
  gridColumn: `${x + 1} / span ${w}`,
  gridRow: `${y + 1} / span ${h}`,
});

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
  const { width, containerRef, mounted } = useContainerWidth<HTMLDivElement>();
  const { isEditing } = useDashboard();
  const { tiles, dropPreview, activeId, onMoveStart, onResizeStart, dropHandlers } = useDashboardGrid(
    containerRef,
    width,
  );

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
            <div key={item.id} style={{ height: tileHeight(item.h) }}>
              <DashboardTile item={item} widget={widget} />
            </div>
          ))}
        </div>
      );
    }

    return (
      <div
        style={GRID_STYLE}
        {...(isEditing ? dropHandlers : {})}
        className={cn(
          isEditing && 'min-h-96 rounded-xl outline-2 outline-offset-8 outline-dashed outline-border',
          activeId && 'select-none',
        )}
      >
        {tiles.map(({ item, widget }) => (
          <div
            key={item.id}
            style={cellStyle(item)}
            className={cn('min-w-0', activeId === item.id && 'z-20 opacity-90 shadow-lg')}
          >
            <DashboardTile
              item={item}
              widget={widget}
              handlers={isEditing ? { onMoveStart, onResizeStart } : undefined}
            />
          </div>
        ))}
        {dropPreview && (
          <div
            style={cellStyle(dropPreview)}
            className="pointer-events-none rounded-xl border-2 border-dashed border-primary/50 bg-primary/10"
          />
        )}
      </div>
    );
  };

  return <div ref={containerRef}>{mounted && renderContent()}</div>;
};
