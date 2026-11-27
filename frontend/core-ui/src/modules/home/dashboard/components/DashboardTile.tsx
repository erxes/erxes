import { DashboardTileCrashState } from '@/home/dashboard/components/DashboardTileCrashState';
import { DashboardWidgetConfigDialog } from '@/home/dashboard/components/DashboardWidgetConfigDialog';
import { useDashboard } from '@/home/dashboard/context/DashboardProvider';
import { useDashboardWidgetText } from '@/home/dashboard/hooks/useDashboardWidgetText';
import {
  TDashboardItem,
  TDashboardWidgetDefinition,
} from '@/home/dashboard/types/dashboardTypes';
import { NAVIGATION_EASE } from '@/navigation/constants/navigationMotion';
import { IconGripVertical, IconSettings, IconX } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
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
  const prefersReducedMotion = useReducedMotion();

  return (
    // The whole tile drags while editing, so its content can't be clicked
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.99 }}
      transition={{ duration: 0.16, ease: NAVIGATION_EASE }}
      className={`${DASHBOARD_TILE_HANDLE_CLASS} absolute inset-0 z-10 cursor-move rounded-xl bg-background/45 ring-2 ring-primary/45 backdrop-blur-[1.5px] transition-shadow hover:ring-primary/70`}
    >
      <div className="absolute top-2 left-2 flex items-center gap-1 rounded-lg border border-border/70 bg-background/95 px-2 py-1 text-xs font-medium shadow-xs backdrop-blur-sm">
        <IconGripVertical className="size-3.5 text-muted-foreground" />
        {getText(widget).label}
      </div>
      <div
        className={`${DASHBOARD_TILE_ACTION_CLASS} absolute top-2 right-2 flex items-center gap-1`}
      >
        {widget.ConfigForm && (
          <Button
            variant="secondary"
            size="icon"
            className="shadow-xs transition-transform active:scale-95"
            aria-label={t('dashboard.configure')}
            onClick={() => setConfigOpen(true)}
          >
            <IconSettings />
          </Button>
        )}
        <Button
          variant="secondary"
          size="icon"
          className="text-destructive shadow-xs transition-transform active:scale-95"
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
    </motion.div>
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
    <div className="relative h-full rounded-xl transition-shadow duration-200 hover:shadow-sm">
      <ErrorBoundary
        FallbackComponent={DashboardTileCrashState}
        resetKeys={[item.config]}
      >
        <Component config={item.config} />
      </ErrorBoundary>
      <AnimatePresence>
        {isEditing && <DashboardTileEditOverlay item={item} widget={widget} />}
      </AnimatePresence>
    </div>
  );
};
