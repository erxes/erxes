import { ApprovalRequestsConfigForm } from '@/approval/dashboard/components/ApprovalRequestsConfigForm';
import { ApprovalRequestsWidget } from '@/approval/dashboard/widgets/ApprovalRequestsWidget';
import { TDashboardWidgetDefinition } from '@/home/dashboard/types/dashboardTypes';
import { IconChecklist } from '@tabler/icons-react';

export const APPROVAL_DASHBOARD_WIDGETS: TDashboardWidgetDefinition[] = [
  {
    type: 'approval.requests',
    group: 'home',
    preview: 'list',
    ns: 'common',
    labelKey: 'home.widgets.approvals',
    descriptionKey: 'home.widgets.approvals-description',
    icon: IconChecklist,
    defaultSize: { w: 6, h: 6 },
    minSize: { w: 4, h: 4 },
    Component: ApprovalRequestsWidget,
    ConfigForm: ApprovalRequestsConfigForm,
  },
];
