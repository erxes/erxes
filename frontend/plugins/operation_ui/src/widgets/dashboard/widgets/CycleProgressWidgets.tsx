import { CycleProgressByProjectList } from '@/cycle/components/detail/CycleProgressByProject';
import { CycleProgressChartView } from '@/cycle/components/detail/CycleProgressChart';
import { useGetCycleProgress } from '@/cycle/hooks/useGetCycleProgress';
import { useGetCycleProgressByMember } from '@/cycle/hooks/useGetCycleProgressByMember';
import { useGetCycleProgressByProject } from '@/cycle/hooks/useGetCycleProgressByProject';
import { useGetCycleProgressChart } from '@/cycle/hooks/useGetCycleProgressChart';
import { ICycleStatistics } from '@/cycle/types';
import { ProgressSummary } from '@/operation/components/progress/ScopeProgress';
import { ProgressByMemberList } from '@/project/components/details/ProgressByMember';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardWidgetCard, TDashboardWidgetConfig } from 'ui-modules';
import { OperationDashboardBody } from '~/widgets/dashboard/components/OperationDashboardBody';
import { OperationDashboardOpenLink } from '~/widgets/dashboard/components/OperationDashboardOpenLink';
import { useDashboardCycle } from '~/widgets/dashboard/hooks/useDashboardTarget';

type TCycleWidgetProps = { config?: TDashboardWidgetConfig | null };

// What a section needs: a live cycle is queried, a completed one is read
// from its stored statistics (the cycle page does the same).
type TCycleSectionProps = {
  cycleId: string;
  isCompleted: boolean;
  statistics?: ICycleStatistics;
};

const CycleDashboardTile = ({
  config,
  title,
  titleOf,
  children,
}: TCycleWidgetProps & {
  title: string;
  titleOf: string;
  children: (cycle: TCycleSectionProps) => ReactNode;
}) => {
  const { t } = useTranslation('operation');
  const {
    configured,
    followsCurrent,
    cycleId,
    cycle,
    isCompleted,
    statistics,
    loading,
    error,
    refetch,
    href,
  } = useDashboardCycle(config);

  const emptyLabel = (() => {
    if (!configured) {
      return t('dashboard.not-configured');
    }
    return followsCurrent && !cycleId
      ? t('dashboard.no-active-cycle')
      : t('dashboard.cycle-gone');
  })();

  return (
    <DashboardWidgetCard
      title={cycle?.name ? t(titleOf, { name: cycle.name }) : t(title)}
      action={<OperationDashboardOpenLink to={cycle && href} />}
    >
      <OperationDashboardBody
        loading={loading}
        error={error}
        onRetry={refetch}
        isEmpty={!cycleId || !cycle}
        emptyLabel={emptyLabel}
      >
        {cycleId && children({ cycleId, isCompleted, statistics })}
      </OperationDashboardBody>
    </DashboardWidgetCard>
  );
};

const CycleProgressSection = ({
  cycleId,
  isCompleted,
  statistics,
}: TCycleSectionProps) => {
  const { t } = useTranslation('operation');
  const liveId = isCompleted ? undefined : cycleId;
  const progress = useGetCycleProgress(liveId);
  const chart = useGetCycleProgressChart(liveId);
  const summary = progress.cycleProgress || statistics?.progress;

  return (
    <OperationDashboardBody
      loading={progress.loading || chart.loading}
      error={progress.error || chart.error}
      onRetry={() => {
        void progress.refetch();
        void chart.refetch();
      }}
      isEmpty={!summary}
      emptyLabel={t('dashboard.no-tasks')}
    >
      <div className="px-2">
        <ProgressSummary progress={summary} />
        <CycleProgressChartView
          progress={chart.getCycleProgressChart || statistics?.chartData}
        />
      </div>
    </OperationDashboardBody>
  );
};

const CycleByMemberSection = ({
  cycleId,
  isCompleted,
  statistics,
}: TCycleSectionProps) => {
  const { t } = useTranslation('operation');
  const { cycleProgressByMember, loading, error, refetch } =
    useGetCycleProgressByMember(isCompleted ? undefined : cycleId);
  const items = cycleProgressByMember || statistics?.progressByMember || [];

  return (
    <OperationDashboardBody
      loading={loading}
      error={error}
      onRetry={() => refetch()}
      isEmpty={!items.length}
      emptyLabel={t('dashboard.no-tasks')}
    >
      <ProgressByMemberList items={items} />
    </OperationDashboardBody>
  );
};

const CycleByProjectSection = ({
  cycleId,
  isCompleted,
  statistics,
}: TCycleSectionProps) => {
  const { t } = useTranslation('operation');
  const { cycleProgressByProject, loading, error, refetch } =
    useGetCycleProgressByProject(isCompleted ? undefined : cycleId);
  const items = cycleProgressByProject || statistics?.progressByProject || [];

  return (
    <OperationDashboardBody
      loading={loading}
      error={error}
      onRetry={() => refetch()}
      isEmpty={!items.length}
      emptyLabel={t('dashboard.no-tasks')}
    >
      <CycleProgressByProjectList items={items} />
    </OperationDashboardBody>
  );
};

/** A cycle's scope counts and its burn-up chart. */
export const CycleProgressWidget = ({ config }: TCycleWidgetProps) => (
  <CycleDashboardTile
    config={config}
    title="dashboard.cycle-progress"
    titleOf="dashboard.cycle-progress-of"
  >
    {(cycle) => <CycleProgressSection {...cycle} />}
  </CycleDashboardTile>
);

export const CycleProgressByMemberWidget = ({ config }: TCycleWidgetProps) => (
  <CycleDashboardTile
    config={config}
    title="dashboard.cycle-progress-by-member"
    titleOf="dashboard.cycle-progress-by-member-of"
  >
    {(cycle) => <CycleByMemberSection {...cycle} />}
  </CycleDashboardTile>
);

export const CycleProgressByProjectWidget = ({ config }: TCycleWidgetProps) => (
  <CycleDashboardTile
    config={config}
    title="dashboard.cycle-progress-by-project"
    titleOf="dashboard.cycle-progress-by-project-of"
  >
    {(cycle) => <CycleByProjectSection {...cycle} />}
  </CycleDashboardTile>
);
