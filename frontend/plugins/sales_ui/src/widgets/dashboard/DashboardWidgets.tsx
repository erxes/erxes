import { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DashboardWidgetCard,
  DashboardWidgetEmptyState,
  IDashboardWidgetProps,
  TDashboardWidgetConfig,
} from 'ui-modules';
import { SalesLoyaltyConfigForm } from './components/SalesLoyaltyConfigForm';
import {
  SalesLoyaltyByPipelineWidget,
  SalesLoyaltyFlowWidget,
  SalesLoyaltyKpisWidget,
  SalesLoyaltyRunningNetWidget,
  SalesLoyaltyTopDealsWidget,
  SalesLoyaltyTopEarnersWidget,
  SalesLoyaltyTopSpendersWidget,
} from './components/SalesLoyaltyWidgets';
import {
  SALES_DASHBOARD_MODULES,
  SALES_DASHBOARD_TIMELINE_MODULES,
} from './salesDashboardConfig';

const WIDGETS: Record<
  string,
  ComponentType<{ config?: TDashboardWidgetConfig | null }>
> = {
  [SALES_DASHBOARD_MODULES.loyaltyKpis]: SalesLoyaltyKpisWidget,
  [SALES_DASHBOARD_MODULES.loyaltyFlow]: SalesLoyaltyFlowWidget,
  [SALES_DASHBOARD_MODULES.loyaltyRunningNet]: SalesLoyaltyRunningNetWidget,
  [SALES_DASHBOARD_MODULES.loyaltyByPipeline]: SalesLoyaltyByPipelineWidget,
  [SALES_DASHBOARD_MODULES.loyaltyTopDeals]: SalesLoyaltyTopDealsWidget,
  [SALES_DASHBOARD_MODULES.loyaltyTopEarners]: SalesLoyaltyTopEarnersWidget,
  [SALES_DASHBOARD_MODULES.loyaltyTopSpenders]: SalesLoyaltyTopSpendersWidget,
};

const UnknownWidget = () => {
  const { t } = useTranslation('sales');

  return (
    <DashboardWidgetCard title={t('sales', 'Sales')}>
      <DashboardWidgetEmptyState>
        {t('dashboard-widget-unknown', 'This widget is no longer available')}
      </DashboardWidgetEmptyState>
    </DashboardWidgetCard>
  );
};

/**
 * The sales `./dashboardWidget` remote: a home dashboard tile, or its
 * settings form, by `module`. The core resolves this export by its name.
 */
export const DashboardWidget = (props: IDashboardWidgetProps) => {
  const Widget = WIDGETS[props.module];

  if (props.mode === 'config') {
    return Widget ? (
      <SalesLoyaltyConfigForm
        config={props.config}
        withInterval={SALES_DASHBOARD_TIMELINE_MODULES.includes(props.module)}
        onSubmit={props.onConfigSubmit}
        onCancel={props.onConfigCancel}
      />
    ) : (
      <UnknownWidget />
    );
  }

  return Widget ? <Widget config={props.config} /> : <UnknownWidget />;
};
