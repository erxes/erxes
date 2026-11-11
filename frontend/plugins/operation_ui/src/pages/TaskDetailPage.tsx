import { useGetProject } from '@/project/hooks/useGetProject';
import { ProjectBreadCrumb } from '@/project/components/breadcumb/ProjectBreadCrumb';
import { TaskBreadCrump } from '@/task/components/breadcrump/TaskBreadCrump';
import { TaskDetailBreadCrump } from '@/task/components/breadcrump/TaskDetailBreadCrump';
import { useGetTask } from '@/task/hooks/useGetTask';
import { TeamBreadCrumb } from '@/team/components/breadcrumb/TeamBreadCrumb';
import { OperationRecordPage } from '@/operation/components/OperationRecordPage';
import { Breadcrumb, Button, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { TaskPanelActions } from '~/widgets/record-panel/TaskPanelActions';
import {
  TaskPanelActivity,
  TaskPanelTitle,
} from '~/widgets/record-panel/RecordPanel';
import {
  TaskPageDescription,
  TaskPageFields,
} from '~/widgets/record-panel/TaskPanelDetail';

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

/** A task on its own page, using the shared operation record layout. */
export const TaskDetailPage = () => {
  const { t } = useTranslation('operation');
  const { taskId } = useParams<{ taskId: string }>();
  const { task, loading, error, refetch } = useGetTask(taskId);

  if (!taskId) return null;

  return (
    <OperationRecordPage
      recordId={taskId}
      breadcrumb={<TaskPageBreadcrumb />}
      actions={<TaskPanelActions taskId={taskId} />}
      title={<TaskPanelTitle taskId={taskId} />}
      fields={<TaskPageFields taskId={taskId} />}
      description={<TaskPageDescription taskId={taskId} />}
      activity={<TaskPanelActivity taskId={taskId} />}
      found={!!task}
      loading={loading}
      error={error}
      notFoundLabel={t('task-not-found', 'Task not found')}
      onRetry={() => {
        void refetch().catch(() => undefined);
      }}
    />
  );
};
