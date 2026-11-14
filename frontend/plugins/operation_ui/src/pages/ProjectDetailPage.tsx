import { OperationRecordPage } from '@/operation/components/OperationRecordPage';
import { ProjectPageBreadcrumb } from '@/project/components/breadcumb/ProjectPageBreadcrumb';
import { ProjectReport } from '@/project/components/details/ProjectsSideWidget';
import { PROJECT_CONTENT_TYPE } from '@/project/constants/contentType';
import { useGetProject } from '@/project/hooks/useGetProject';
import { AddTaskButton } from '@/task/components/add-task/AddTaskButton';
import {
  IconChartHistogram,
  IconHierarchy2,
  IconMinimize,
} from '@tabler/icons-react';
import { Button, ScrollArea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { createSearchParams, Link, useParams } from 'react-router-dom';
import { Can, getSidePanelRecordPath } from 'ui-modules';
import {
  ProjectPanel,
  ProjectPanelTitle,
} from '~/widgets/record-panel/ProjectPanel';
import { ProjectPanelActions } from '~/widgets/record-panel/ProjectPanelActions';
import {
  ProjectPageDescription,
  ProjectPageFields,
} from '~/widgets/record-panel/ProjectPanelDetail';

export const ProjectDetailPage = () => {
  const { t } = useTranslation('operation');
  const { t: sidePanelT } = useTranslation('common', {
    keyPrefix: 'side-panel',
  });
  const { projectId, teamId } = useParams<{
    projectId: string;
    teamId?: string;
  }>();
  const { project, loading, error, refetch } = useGetProject(projectId);

  if (!projectId) return null;

  const listPath = teamId
    ? `/operation/team/${teamId}/projects`
    : '/operation/projects';
  const panelSearch = createSearchParams({
    panel: getSidePanelRecordPath({
      contentType: PROJECT_CONTENT_TYPE,
      contentId: projectId,
    }),
  });
  const collapseLabel = sidePanelT('collapse', 'Collapse record');

  return (
    <OperationRecordPage
      recordId={projectId}
      breadcrumb={<ProjectPageBreadcrumb />}
      actions={
        project && (
          <>
            <ProjectPanelActions project={project} />
            <Button variant="ghost" size="icon" className="size-7" asChild>
              <Link
                to={{ pathname: listPath, search: `?${panelSearch}` }}
                title={collapseLabel}
                aria-label={collapseLabel}
              >
                <IconMinimize className="size-4" />
              </Link>
            </Button>
            <Can action="taskCreate">
              <AddTaskButton />
            </Can>
          </>
        )
      }
      title={project && <ProjectPanelTitle project={project} />}
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
