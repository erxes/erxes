import { OperationRecordPage } from '@/operation/components/OperationRecordPage';
import { ProjectPageBreadcrumb } from '@/project/components/breadcumb/ProjectPageBreadcrumb';
import { ProjectReport } from '@/project/components/details/ProjectsSideWidget';
import { PROJECT_CONTENT_TYPE } from '@/project/constants/contentType';
import { useGetProject } from '@/project/hooks/useGetProject';
import { AddTaskButton } from '@/task/components/add-task/AddTaskButton';
import { IconChartHistogram, IconHierarchy2 } from '@tabler/icons-react';
import { ScrollArea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Can } from 'ui-modules';
import { ProjectPanel } from '~/widgets/record-panel/ProjectPanel';
import { ProjectPanelActions } from '~/widgets/record-panel/ProjectPanelActions';
import {
  ProjectPageDescription,
  ProjectPageFields,
} from '~/widgets/record-panel/ProjectPanelDetail';

export const ProjectDetailPage = () => {
  const { t } = useTranslation('operation');
  const { projectId, teamId } = useParams<{
    projectId: string;
    teamId?: string;
  }>();
  const { project, loading, error, refetch } = useGetProject(projectId);

  if (!projectId) return null;

  // Minimize onto the team list only while the project still belongs to it.
  const listPath =
    teamId && project?.teamIds?.includes(teamId)
      ? `/operation/team/${teamId}/projects`
      : '/operation/projects';

  return (
    <OperationRecordPage
      recordId={projectId}
      minimizeTo={{
        record: { contentType: PROJECT_CONTENT_TYPE, contentId: projectId },
        listPath,
      }}
      breadcrumb={<ProjectPageBreadcrumb />}
      actions={
        project && (
          <>
            <ProjectPanelActions project={project} />
            <Can action="taskCreate">
              <AddTaskButton />
            </Can>
          </>
        )
      }
      title={t('project-details')}
      fields={project && <ProjectPageFields project={project} />}
      description={project && <ProjectPageDescription project={project} />}
      activity={
        <ProjectPanel
          contentType={PROJECT_CONTENT_TYPE}
          contentId={projectId}
          view="activity"
        />
      }
      extraTabs={[
        {
          value: 'report',
          label: t('project-report'),
          icon: IconChartHistogram,
          content: (
            <ScrollArea
              className="flex-1 min-h-0"
              viewportClassName="[&>div]:block!"
            >
              <div className="mx-auto w-full max-w-3xl">
                <ProjectReport projectId={projectId} />
              </div>
            </ScrollArea>
          ),
        },
        {
          value: 'properties',
          label: t('properties', 'Properties'),
          icon: IconHierarchy2,
          content: (
            <ProjectPanel
              contentType={PROJECT_CONTENT_TYPE}
              contentId={projectId}
              view="properties"
            />
          ),
        },
      ]}
      found={!!project}
      loading={loading}
      error={error}
      notFoundLabel={t('project-not-found', 'Project not found')}
      onRetry={() => {
        void refetch().catch(() => undefined);
      }}
    />
  );
};
