import { IDashboardWidgetProps } from 'ui-modules';
import {
  RecentScoreLogsConfigForm,
  RecentVouchersConfigForm,
  ScoreSummaryConfigForm,
} from './components/LoyaltyDashboardConfigForms';
import { LOYALTY_DASHBOARD_MODULES } from './dashboardWidgetConfig';
import { RecentCouponsDashboardWidget } from './widgets/RecentCouponsDashboardWidget';
import { RecentScoreLogsDashboardWidget } from './widgets/RecentScoreLogsDashboardWidget';
import { RecentVouchersDashboardWidget } from './widgets/RecentVouchersDashboardWidget';
import { ScoreSummaryDashboardWidget } from './widgets/ScoreSummaryDashboardWidget';

const DashboardWidgetConfig = (
  props: Extract<IDashboardWidgetProps, { mode: 'config' }>,
) => {
  const formProps = {
    config: props.config,
    onSubmit: props.onConfigSubmit,
    onCancel: props.onConfigCancel,
  };

  switch (props.module) {
    case LOYALTY_DASHBOARD_MODULES.scoreSummary:
      return <ScoreSummaryConfigForm {...formProps} />;
    case LOYALTY_DASHBOARD_MODULES.recentScoreLogs:
      return <RecentScoreLogsConfigForm {...formProps} />;
    case LOYALTY_DASHBOARD_MODULES.recentVouchers:
      return <RecentVouchersConfigForm {...formProps} />;
    default:
      return null;
  }
};

// Loyalty's home dashboard tiles, one per `widgets.dashboardWidgets` module.
export const DashboardWidgets = (props: IDashboardWidgetProps) => {
  if (props.mode === 'config') {
    return <DashboardWidgetConfig {...props} />;
  }

  switch (props.module) {
    case LOYALTY_DASHBOARD_MODULES.scoreSummary:
      return <ScoreSummaryDashboardWidget config={props.config} />;
    case LOYALTY_DASHBOARD_MODULES.recentScoreLogs:
      return <RecentScoreLogsDashboardWidget config={props.config} />;
    case LOYALTY_DASHBOARD_MODULES.recentVouchers:
      return <RecentVouchersDashboardWidget config={props.config} />;
    case LOYALTY_DASHBOARD_MODULES.recentCoupons:
      return <RecentCouponsDashboardWidget />;
    default:
      return null;
  }
};
