import { DashboardWidgetConfigDialog } from '@/home/dashboard/components/DashboardWidgetConfigDialog';
import { useDashboard } from '@/home/dashboard/context/DashboardProvider';

/** Settings for a tile just placed; cancelling takes the tile back off. */
export const DashboardPendingConfigDialog = () => {
  const { pendingConfig, submitPendingConfig, cancelPendingConfig } =
    useDashboard();

  if (!pendingConfig) {
    return null;
  }

  return (
    <DashboardWidgetConfigDialog
      widget={pendingConfig.widget}
      config={pendingConfig.item.config}
      open
      onOpenChange={(open) => !open && cancelPendingConfig()}
      onSubmit={submitPendingConfig}
    />
  );
};
