import { APPROVAL_DASHBOARD_WIDGETS } from '@/approval/dashboard/approvalDashboardWidgets';
import { AUTOMATION_DASHBOARD_WIDGETS } from '@/automations/dashboard/automationDashboardWidgets';
import { TDashboardWidgetDefinition } from '@/home/dashboard/types/dashboardTypes';
import { HOME_DASHBOARD_WIDGETS } from '@/home/dashboard/widgets/homeWidgets';

// Every widget the home dashboard can place, in catalog order.
export const DASHBOARD_WIDGETS: TDashboardWidgetDefinition[] = [
  ...HOME_DASHBOARD_WIDGETS,
  ...APPROVAL_DASHBOARD_WIDGETS,
  ...AUTOMATION_DASHBOARD_WIDGETS,
];
