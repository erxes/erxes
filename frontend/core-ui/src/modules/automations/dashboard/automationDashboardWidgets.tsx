import { TAutomationStatsSection } from '@/automations/dashboard/automationDashboardConfig';
import {
  AutomationActivityConfigForm,
  AutomationListConfigForm,
  AutomationRunsConfigForm,
  AutomationStatsConfigForm,
} from '@/automations/dashboard/components/AutomationDashboardConfigForms';
import { AutomationListWidget } from '@/automations/dashboard/widgets/AutomationListWidget';
import { AutomationRunsWidget } from '@/automations/dashboard/widgets/AutomationRunsWidget';
import { AutomationStatsWidget } from '@/automations/dashboard/widgets/AutomationStatsWidget';
import {
  TDashboardGridSize,
  TDashboardWidgetDefinition,
  TDashboardWidgetProps,
} from '@/home/dashboard/types/dashboardTypes';
import { TDashboardWidgetPreview } from 'erxes-ui';
import {
  Icon,
  IconAlertTriangle,
  IconChartBar,
  IconChartLine,
  IconGauge,
  IconHistory,
  IconListDetails,
  IconSitemap,
} from '@tabler/icons-react';

const AUTOMATIONS_MODULE = 'automations';

const statsSection = (
  section: TAutomationStatsSection,
  icon: Icon,
  defaultSize: TDashboardGridSize,
  minSize: TDashboardGridSize,
  preview: TDashboardWidgetPreview,
): TDashboardWidgetDefinition => {
  const StatsSectionWidget = ({ config }: TDashboardWidgetProps) => (
    <AutomationStatsWidget config={config} section={section} />
  );
  StatsSectionWidget.displayName = `AutomationStatsWidget(${section})`;

  return {
    type: `automations.stats.${section}`,
    group: AUTOMATIONS_MODULE,
    preview,
    ns: 'common',
    labelKey: `home.widgets.automation-stats-${section}`,
    descriptionKey: `home.widgets.automation-stats-${section}-description`,
    icon,
    modulePath: AUTOMATIONS_MODULE,
    defaultSize,
    minSize,
    Component: StatsSectionWidget,
    ConfigForm:
      section === 'activity'
        ? AutomationActivityConfigForm
        : AutomationStatsConfigForm,
  };
};

export const AUTOMATION_DASHBOARD_WIDGETS: TDashboardWidgetDefinition[] = [
  {
    type: 'automations.list',
    group: AUTOMATIONS_MODULE,
    preview: 'table',
    ns: 'common',
    labelKey: 'home.widgets.automations-list',
    descriptionKey: 'home.widgets.automations-list-description',
    icon: IconListDetails,
    modulePath: AUTOMATIONS_MODULE,
    // Five columns; narrower than 8 the table only scrolls sideways
    defaultSize: { w: 12, h: 6 },
    minSize: { w: 8, h: 4 },
    Component: AutomationListWidget,
    ConfigForm: AutomationListConfigForm,
  },
  {
    type: 'automations.runs',
    group: AUTOMATIONS_MODULE,
    preview: 'list',
    ns: 'common',
    labelKey: 'home.widgets.automation-runs',
    descriptionKey: 'home.widgets.automation-runs-description',
    icon: IconHistory,
    modulePath: AUTOMATIONS_MODULE,
    defaultSize: { w: 6, h: 6 },
    minSize: { w: 5, h: 4 },
    Component: AutomationRunsWidget,
    ConfigForm: AutomationRunsConfigForm,
  },
  statsSection('overview', IconGauge, { w: 12, h: 5 }, { w: 6, h: 4 }, 'kpi'),
  statsSection(
    'activity',
    IconChartBar,
    { w: 12, h: 10 },
    { w: 8, h: 8 },
    'heatmap',
  ),
  statsSection('chart', IconChartLine, { w: 12, h: 8 }, { w: 6, h: 6 }, 'bar'),
  statsSection(
    'errors',
    IconAlertTriangle,
    { w: 6, h: 6 },
    { w: 4, h: 4 },
    'list',
  ),
  statsSection('nodes', IconSitemap, { w: 12, h: 7 }, { w: 6, h: 5 }, 'table'),
];
