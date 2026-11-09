import {
  TDashboardWidgetConfig,
  TDashboardWidgetDefinition,
} from '@/home/dashboard/types/dashboardTypes';
import { useDashboardWidgetText } from '@/home/dashboard/hooks/useDashboardWidgetText';
import { Dialog } from 'erxes-ui';

/** The widget's own settings form, for a new tile or an existing one. */
export const DashboardWidgetConfigDialog = ({
  widget,
  config,
  open,
  onOpenChange,
  onSubmit,
}: {
  widget: TDashboardWidgetDefinition;
  config?: TDashboardWidgetConfig | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (config: TDashboardWidgetConfig) => void;
}) => {
  const getText = useDashboardWidgetText();
  const { ConfigForm } = widget;
  const { label, description } = getText(widget);

  if (!ConfigForm) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-lg">
        <Dialog.HeaderCombined title={label} description={description} />
        <ConfigForm
          config={config}
          onCancel={() => onOpenChange(false)}
          // The caller closes it: closing means "cancel" for a new tile
          onSubmit={onSubmit}
        />
      </Dialog.Content>
    </Dialog>
  );
};
