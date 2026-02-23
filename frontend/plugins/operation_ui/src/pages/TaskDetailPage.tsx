import { TaskDetails } from '@/task/components/detail/TaskDetails';
import { TaskDetailBreadCrump } from '@/task/components/breadcrump/TaskDetailBreadCrump';
import { FavoriteToggleIconButton, PageHeader } from 'ui-modules';
import { Breadcrumb, Separator } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { TeamBreadCrumb } from '@/team/components/breadcrumb/TeamBreadCrumb';
import { TaskBreadCrump } from '@/task/components/breadcrump/TaskBreadCrump';
import { TaskDetailActions } from '@/task/components/task-actions/TaskDetailActions';

export const TaskDetailPage = () => {
  const { teamId, taskId } = useParams<{ teamId?: string; taskId: string }>();

  if (!taskId) {
    return null;
  }

  return (
    <>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              {teamId ? (
                <>
                  <TeamBreadCrumb />
                  <Separator.Inline />
                  <TaskBreadCrump link={`/operation/team/${teamId}/tasks`} />
                </>
              ) : (
                <>
                  <TaskBreadCrump link={`/operation/tasks`} />
                </>
              )}
              <Separator.Inline />
              <TaskDetailBreadCrump />
              <TaskDetailActions taskId={taskId} />
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>
      </PageHeader>
      <TaskDetails taskId={taskId} />
    </>
  );
};
