import { DashboardWidgetEmptyState, DashboardWidgetCard } from 'ui-modules';
import { AutomationStatsActivity } from '@/automations/components/builder/stats/components/AutomationStatsActivity';
import { AutomationStatsChart } from '@/automations/components/builder/stats/components/AutomationStatsChart';
import { AutomationStatsErrorMessages } from '@/automations/components/builder/stats/components/AutomationStatsErrorMessages';
import { AutomationStatsNodes } from '@/automations/components/builder/stats/components/AutomationStatsNodes';
import { AutomationStatsOverview } from '@/automations/components/builder/stats/components/AutomationStatsOverview';
import { AutomationStatsNodesProvider } from '@/automations/components/builder/stats/context/AutomationStatsNodesContext';
import {
  automationStatsConfigSchema,
  TAutomationStatsSection,
} from '@/automations/dashboard/automationDashboardConfig';
import { AutomationDashboardBody } from '@/automations/dashboard/components/AutomationDashboardStates';
import {
  useAutomationDashboardDetail,
  useAutomationDashboardStats,
} from '@/automations/dashboard/hooks/useAutomationDashboardStats';
import { useAutomationStatsActivity } from '@/automations/components/builder/stats/hooks/useAutomationStatsActivity';
import { AutomationBuilderTabsType } from '@/automations/types';
import { TDashboardWidgetProps } from '@/home/dashboard/types/dashboardTypes';
import { Button } from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const SECTION_TITLE_KEYS: Record<TAutomationStatsSection, string> = {
  overview: 'dashboard-stats-overview',
  activity: 'dashboard-stats-activity',
  chart: 'dashboard-stats-chart',
  errors: 'dashboard-stats-errors',
  nodes: 'dashboard-stats-nodes',
};

type TSectionProps = { automationId: string; days: number };

// Activity asks for its own ranges, so it never loads the windowed stats
const ActivitySection = ({ automationId }: TSectionProps) => {
  const activity = useAutomationStatsActivity(automationId);

  return <AutomationStatsActivity {...activity} />;
};

const WindowedSection = ({
  automationId,
  days,
  section,
}: TSectionProps & {
  section: Exclude<TAutomationStatsSection, 'activity'>;
}) => {
  const { t } = useTranslation('automations');
  const { stats, loading, error, refetch, beginDate, endDate } =
    useAutomationDashboardStats(automationId, days);

  const renderSection = () => {
    if (!stats) {
      return null;
    }

    switch (section) {
      case 'overview':
        return <AutomationStatsOverview stats={stats} />;
      case 'chart':
        return (
          <AutomationStatsChart
            timeSeries={stats.timeSeries}
            beginDate={beginDate}
            endDate={endDate}
          />
        );
      case 'errors':
        return (
          <AutomationStatsErrorMessages errorMessages={stats.errorMessages} />
        );
      case 'nodes':
        return <AutomationStatsNodes nodes={stats.nodes} />;
    }
  };

  return (
    <AutomationDashboardBody
      loading={loading}
      error={error}
      onRetry={() => refetch()}
      isEmpty={!stats}
      emptyLabel={t('stats-no-runs')}
    >
      {renderSection()}
    </AutomationDashboardBody>
  );
};

/** One section of an automation's Stats tab, for the chosen period. */
export const AutomationStatsWidget = ({
  config,
  section,
}: TDashboardWidgetProps & { section: TAutomationStatsSection }) => {
  const { t } = useTranslation('automations');
  const parsed = useMemo(
    () => automationStatsConfigSchema.safeParse(config),
    [config],
  );
  const automationId = parsed.success ? parsed.data.automationId : undefined;
  const days = parsed.success ? parsed.data.days : 30;
  const { detail, loading, error } = useAutomationDashboardDetail(automationId);

  const sectionTitle = t(SECTION_TITLE_KEYS[section]);
  const showsPeriod = section !== 'activity';

  const renderBody = () => {
    if (!automationId) {
      return (
        <DashboardWidgetEmptyState>
          {t('dashboard-not-configured')}
        </DashboardWidgetEmptyState>
      );
    }

    if (!loading && !error && !detail) {
      return (
        <DashboardWidgetEmptyState>
          {t('dashboard-automation-unavailable')}
        </DashboardWidgetEmptyState>
      );
    }

    return (
      <AutomationStatsNodesProvider
        actions={detail?.actions}
        workflows={detail?.workflows}
      >
        {section === 'activity' ? (
          <ActivitySection automationId={automationId} days={days} />
        ) : (
          <WindowedSection
            automationId={automationId}
            days={days}
            section={section}
          />
        )}
      </AutomationStatsNodesProvider>
    );
  };

  return (
    <DashboardWidgetCard
      title={
        detail?.name
          ? `${sectionTitle} · ${detail.name}${
              showsPeriod
                ? ` · ${t('dashboard-last-days', { count: days })}`
                : ''
            }`
          : sectionTitle
      }
      action={
        automationId && (
          <Button variant="ghost" size="sm" asChild>
            <Link
              to={`/automations/edit/${automationId}?activeTab=${AutomationBuilderTabsType.Stats}`}
            >
              {t('dashboard-open-stats')}
            </Link>
          </Button>
        )
      }
    >
      {renderBody()}
    </DashboardWidgetCard>
  );
};
