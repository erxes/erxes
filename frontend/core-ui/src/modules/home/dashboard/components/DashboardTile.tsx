import { DashboardTileCrashState } from '@/home/dashboard/components/DashboardTileCrashState';
import { DashboardWidgetConfigDialog } from '@/home/dashboard/components/DashboardWidgetConfigDialog';
import { useDashboard } from '@/home/dashboard/context/DashboardProvider';
import { useDashboardWidgetText } from '@/home/dashboard/hooks/useDashboardWidgetText';
import {
  TDashboardItem,
  TDashboardWidgetDefinition,
} from '@/home/dashboard/types/dashboardTypes';
import { IconGripVertical, IconSettings, IconX } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';

export const DASHBOARD_TILE_HANDLE_CLASS = 'dashboard-tile-handle';
export const DASHBOARD_TILE_ACTION_CLASS = 'dashboard-tile-action';

const DashboardTileEditOverlay = ({
  item,
  widget,
}: {
  item: TDashboardItem;
  widget: TDashboardWidgetDefinition;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'home' });
  const { removeItem, updateConfig } = useDashboard();
  const [configOpen, setConfigOpen] = useState(false);
  const getText = useDashboardWidgetText();

  return (
    // The whole tile drags while editing, so its content can't be clicked
    <div
      className={`${DASHBOARD_TILE_HANDLE_CLASS} absolute inset-0 z-10 cursor-move rounded-xl bg-background/40 ring-2 ring-primary/40`}
    >
      <div className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-background px-1.5 py-1 text-xs font-medium shadow-xs">
        <IconGripVertical className="size-3.5 text-muted-foreground" />
        {getText(widget).label}
      </div>
      <div
        className={`${DASHBOARD_TILE_ACTION_CLASS} absolute right-2 top-2 flex items-center gap-1`}
      >
        {widget.ConfigForm && (
          <Button
            variant="secondary"
            size="icon"
            aria-label={t('dashboard.configure')}
            onClick={() => setConfigOpen(true)}
          >
            <IconSettings />
          </Button>
        )}
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
      <DashboardWidgetConfigDialog
        widget={widget}
        config={item.config}
        open={configOpen}
        onOpenChange={setConfigOpen}
        onSubmit={(config) => {
          updateConfig(item.id, config);
          setConfigOpen(false);
        }}
      />
    </div>
  );
};

export const DashboardTile = ({
  item,
  widget,
}: {
  item: TDashboardItem;
  widget: TDashboardWidgetDefinition;
}) => {
  const { isEditing } = useDashboard();
  const { Component } = widget;

  return (
    <div className="relative h-full">
      <ErrorBoundary
        FallbackComponent={DashboardTileCrashState}
        resetKeys={[item.config]}
      >
        <Component config={item.config} />
      </ErrorBoundary>
      {isEditing && <DashboardTileEditOverlay item={item} widget={widget} />}
    </div>
  );
};
