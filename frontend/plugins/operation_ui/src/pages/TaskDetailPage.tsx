import { TaskDetails } from '@/task/components/detail/TaskDetails';
import { TaskSideWidgets } from '~/widgets/relation/TaskSideWidgets';
import { useGetTask } from '@/task/hooks/useGetTask';
import { TaskDetailBreadCrump } from '@/task/components/breadcrump/TaskDetailBreadCrump';
import { PageHeader } from 'ui-modules';
import { Breadcrumb, FocusSheet, ScrollArea, Separator } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { TeamBreadCrumb } from '@/team/components/breadcrumb/TeamBreadCrumb';
import { TaskBreadCrump } from '@/task/components/breadcrump/TaskBreadCrump';
import { TaskDetailActions } from '@/task/components/task-actions/TaskDetailActions';

export const TaskDetailPage = () => {
  const { teamId, taskId } = useParams<{ teamId?: string; taskId: string }>();
  const { task } = useGetTask({
    variables: { _id: taskId },
    skip: !taskId,
  });

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
                <TaskBreadCrump link={`/operation/tasks`} />
              )}
              <Separator.Inline />
              <TaskDetailBreadCrump />
              <TaskDetailActions taskId={taskId} />
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>
      </PageHeader>
      <div className="h-full w-full flex flex-1 overflow-hidden">
        <ScrollArea className="flex-1 min-h-0">
          <div className="w-full xl:max-w-3xl mx-auto p-6">
            <TaskDetails taskId={taskId} />
          </div>
        </ScrollArea>
        {task && (
          <FocusSheet>
            <TaskSideWidgets
              contentId={task._id}
              propertiesData={task.propertiesData}
            />
          </FocusSheet>
        )}
      </div>
    </>
  );
};