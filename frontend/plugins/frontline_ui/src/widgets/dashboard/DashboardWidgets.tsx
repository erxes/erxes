import { useTranslation } from 'react-i18next';
import { DashboardWidgetEmptyState, IDashboardWidgetProps } from 'ui-modules';
import { FrontlineDashboardChart } from './FrontlineDashboardChart';
import { FrontlineDashboardConfigForm } from './FrontlineDashboardConfigForm';
import { getFrontlineDashboardWidget } from './frontlineDashboardWidgets';

// Frontline's home dashboard tiles (`widgets.dashboardWidgets`): one report
// chart each, or the form that sets its filters.
export const DashboardWidgets = (props: IDashboardWidgetProps) => {
  const { t } = useTranslation('frontline');

  if (props.mode === 'view') {
    return (
      <FrontlineDashboardChart module={props.module} config={props.config} />
    );
  }

  const widget = getFrontlineDashboardWidget(props.module);

  if (!widget) {
    return (
      <DashboardWidgetEmptyState>
        {t('dashboard.unknown-widget')}
      </DashboardWidgetEmptyState>
    );
  }

  return (
    <FrontlineDashboardConfigForm
      widget={widget}
      config={props.config}
      onSubmit={props.onConfigSubmit}
      onCancel={props.onConfigCancel}
    />
  );
};

export default DashboardWidgets;
