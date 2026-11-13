import { ProgressSummary } from '@/operation/components/progress/ScopeProgress';
import { ProgressByMemberList } from '@/project/components/details/ProgressByMember';
import { ProgressByTeamList } from '@/project/components/details/ProgressByTeam';
import { ProgressChartView } from '@/project/components/details/ProgressChart';
import { useGetProjectProgress } from '@/project/hooks/useGetProjectProgress';
import { useGetProjectProgressByMember } from '@/project/hooks/useGetProjectProgressByMember';
import { useGetProjectProgressByTeam } from '@/project/hooks/useGetProjectProgressByTeam';
import { useGetProjectProgressChart } from '@/project/hooks/useGetProjectProgressChart';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardWidgetCard, TDashboardWidgetConfig } from 'ui-modules';
import { OperationDashboardBody } from '~/widgets/dashboard/components/OperationDashboardBody';
import { OperationDashboardOpenLink } from '~/widgets/dashboard/components/OperationDashboardOpenLink';
import { useDashboardProject } from '~/widgets/dashboard/hooks/useDashboardTarget';

type TProjectWidgetProps = { config?: TDashboardWidgetConfig | null };

/** The frame of a project tile; `children` draws the chosen project. */
const ProjectDashboardTile = ({
  config,
  title,
  titleOf,
  children,
}: TProjectWidgetProps & {
  title: string;
  titleOf: string;
  children: (projectId: string) => ReactNode;
}) => {
  const { t } = useTranslation('operation');
  const { projectId, project, loading, error, refetch, href } =
    useDashboardProject(config);

  return (
    <DashboardWidgetCard
      title={project?.name ? t(titleOf, { name: project.name }) : t(title)}
      action={<OperationDashboardOpenLink to={project && href} />}
    >
      <OperationDashboardBody
        loading={loading}
        error={error}
        onRetry={() => refetch()}
        isEmpty={!projectId || !project}
        emptyLabel={
          projectId
            ? t('dashboard.project-gone')
            : t('dashboard.not-configured')
        }
      >
        {projectId && children(projectId)}
      </OperationDashboardBody>
    </DashboardWidgetCard>
  );
};

const ProjectProgressSection = ({ projectId }: { projectId: string }) => {
  const { t } = useTranslation('operation');
  const progress = useGetProjectProgress(projectId);
  const chart = useGetProjectProgressChart(projectId);

  return (
    <OperationDashboardBody
      loading={progress.loading || chart.loading}
      error={progress.error || chart.error}
      onRetry={() => {
        void progress.refetch();
        void chart.refetch();
      }}
      isEmpty={!progress.projectProgress}
      emptyLabel={t('dashboard.no-tasks')}
    >
      <div className="px-2">
        <ProgressSummary progress={progress.projectProgress} />
        <ProgressChartView chart={chart.getProjectProgressChart} />
      </div>
    </OperationDashboardBody>
  );
};

const ProjectByMemberSection = ({ projectId }: { projectId: string }) => {
  const { t } = useTranslation('operation');
  const { projectProgressByMember, loading, error, refetch } =
    useGetProjectProgressByMember(projectId);
  const items = projectProgressByMember ?? [];

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

const ProjectByTeamSection = ({ projectId }: { projectId: string }) => {
  const { t } = useTranslation('operation');
  const { projectProgressByTeam, loading, error, refetch } =
    useGetProjectProgressByTeam(projectId);
  const items = projectProgressByTeam ?? [];

  return (
    <OperationDashboardBody
      loading={loading}
      error={error}
      onRetry={() => refetch()}
      isEmpty={!items.length}
      emptyLabel={t('dashboard.no-tasks')}
    >
      <ProgressByTeamList items={items} />
    </OperationDashboardBody>
  );
};

/** A project's scope counts and its burn-up chart. */
export const ProjectProgressWidget = ({ config }: TProjectWidgetProps) => (
  <ProjectDashboardTile
    config={config}
    title="dashboard.project-progress"
    titleOf="dashboard.project-progress-of"
  >
    {(projectId) => <ProjectProgressSection projectId={projectId} />}
  </ProjectDashboardTile>
);

export const ProjectProgressByMemberWidget = ({
  config,
}: TProjectWidgetProps) => (
  <ProjectDashboardTile
    config={config}
    title="dashboard.project-progress-by-member"
    titleOf="dashboard.project-progress-by-member-of"
  >
    {(projectId) => <ProjectByMemberSection projectId={projectId} />}
  </ProjectDashboardTile>
);

export const ProjectProgressByTeamWidget = ({
  config,
}: TProjectWidgetProps) => (
  <ProjectDashboardTile
    config={config}
    title="dashboard.project-progress-by-team"
    titleOf="dashboard.project-progress-by-team-of"
  >
    {(projectId) => <ProjectByTeamSection projectId={projectId} />}
  </ProjectDashboardTile>
);
