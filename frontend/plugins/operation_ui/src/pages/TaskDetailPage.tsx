import { useGetProject } from '@/project/hooks/useGetProject';
import { ProjectBreadCrumb } from '@/project/components/breadcumb/ProjectBreadCrumb';
import { TaskBreadCrump } from '@/task/components/breadcrump/TaskBreadCrump';
import { TaskDetailBreadCrump } from '@/task/components/breadcrump/TaskDetailBreadCrump';
import { useGetTask } from '@/task/hooks/useGetTask';
import { TeamBreadCrumb } from '@/team/components/breadcrumb/TeamBreadCrumb';
import {
  IconAlignLeft,
  IconHistory,
  IconInfoCircle,
  IconListDetails,
} from '@tabler/icons-react';
import {
  Breadcrumb,
  Button,
  Empty,
  PageContainer,
  Separator,
  Spinner,
  useQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { PageHeader, RecordPageMinimize, RecordSidePanel } from 'ui-modules';
import { TASK_CONTENT_TYPE } from '@/task/constants';
import { TaskPanelActions } from '~/widgets/record-panel/TaskPanelActions';
import {
  TaskPanelActivity,
  TaskPanelTitle,
} from '~/widgets/record-panel/RecordPanel';
import {
  TaskPageDescription,
  TaskPageFields,
} from '~/widgets/record-panel/TaskPanelDetail';

const FIELDS_TAB = 'fields';
const DESCRIPTION_TAB = 'description';
const ACTIVITY_TAB = 'activity';

/** Links back to the tasks of the project the page was opened from. */
const TaskProjectCrumb = ({ link }: { link: string }) => {
  const { projectId } = useParams<{ projectId: string }>();
  const { project } = useGetProject(projectId);

  return (
    <Breadcrumb.Item>
      <Button variant="ghost" asChild>
        <Link to={link}>{project?.name}</Link>
      </Button>
    </Breadcrumb.Item>
  );
};

/** Leads back through the team, project or My Tasks the task was opened from. */
const TaskPageBreadcrumb = () => {
  const { teamId, projectId } = useParams<{
    teamId?: string;
    projectId?: string;
  }>();
  const teamPath = teamId ? `/team/${teamId}` : '';

  return (
    <Breadcrumb>
      <Breadcrumb.List className="gap-1">
        {teamId && (
          <>
            <TeamBreadCrumb />
            <Separator.Inline />
          </>
        )}
        {projectId ? (
          <>
            <ProjectBreadCrumb link={`/operation${teamPath}/projects`} />
            <Separator.Inline />
            <TaskProjectCrumb
              link={`/operation${teamPath}/projects/${projectId}/tasks`}
            />
          </>
        ) : (
          <TaskBreadCrump link={`/operation${teamPath}/tasks`} />
        )}
        <Separator.Inline />
        <TaskDetailBreadCrump />
      </Breadcrumb.List>
    </Breadcrumb>
  );
};

/** A task on its own page, laid out like a contact's: fields beside tabs. */
export const TaskDetailPage = () => {
  const { t } = useTranslation('operation');
  const { taskId, teamId, projectId } = useParams<{
    taskId: string;
    teamId?: string;
    projectId?: string;
  }>();
  const { task, loading } = useGetTask(taskId);
  const teamPath = teamId ? `/team/${teamId}` : '';
  const listPath = projectId
    ? `/operation${teamPath}/projects/${projectId}/tasks`
    : `/operation${teamPath}/tasks`;
  const [tab, setTab] = useQueryState<string>('tab');

  if (!taskId) {
    return null;
  }

  const renderBody = () => {
    if (loading && !task) {
      return <Spinner containerClassName="py-12" />;
    }

    if (!task) {
      return (
        <div className="flex flex-1 items-center justify-center p-6">
          <Empty>
            <Empty.Header>
              <Empty.Media variant="icon">
                <IconInfoCircle />
              </Empty.Media>
              <Empty.Title>{t('task-not-found')}</Empty.Title>
            </Empty.Header>
          </Empty>
        </div>
      );
    }

    return (
      <RecordSidePanel.Tabs
        key={taskId}
        value={tab ?? DESCRIPTION_TAB}
        onValueChange={setTab}
        visibleCount={2}
        overviewTab={FIELDS_TAB}
        expandedDefaultTab={DESCRIPTION_TAB}
        overviewHeader={
          <div className="min-w-0 flex-1 truncate text-sm">
            <TaskPanelTitle taskId={taskId} />
          </div>
        }
        tabs={[
          {
            value: FIELDS_TAB,
            label: t('details', 'Details'),
            icon: IconListDetails,
            content: <TaskPageFields taskId={taskId} />,
          },
          {
            value: DESCRIPTION_TAB,
            label: t('description', 'Description'),
            icon: IconAlignLeft,
            content: <TaskPageDescription taskId={taskId} />,
          },
          {
            value: ACTIVITY_TAB,
            label: t('activity', 'Activity'),
            icon: IconHistory,
            content: <TaskPanelActivity taskId={taskId} />,
          },
        ]}
      />
    );
  };

  return (
    <PageContainer>
      <RecordSidePanel expanded expandedMode="page" expandable={false}>
        <PageHeader>
          <PageHeader.Start>
            <TaskPageBreadcrumb />
          </PageHeader.Start>
          <PageHeader.End>
            <TaskPanelActions taskId={taskId} />
            <RecordPageMinimize
              record={{ contentType: TASK_CONTENT_TYPE, contentId: taskId }}
              listPath={listPath}
            />
          </PageHeader.End>
        </PageHeader>
        {renderBody()}
      </RecordSidePanel>
    </PageContainer>
  );
};
