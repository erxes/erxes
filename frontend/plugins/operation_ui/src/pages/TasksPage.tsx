import { TasksFilter } from '@/task/components/TasksFilter';
import { TasksView, TasksViewControl } from '@/task/components/TasksView';
import { AddTaskSheet } from '@/task/components/add-task/AddTaskSheet';
import { TaskBreadCrump } from '@/task/components/breadcrump/TaskBreadCrump';
import { TasksSideWidget } from '@/task/components/detail/TasksSideWidget';
import { TeamBreadCrumb } from '@/team/components/breadcrumb/TeamBreadCrumb';
import { Breadcrumb, PageSubHeader, Separator } from 'erxes-ui';
import { useLocation, useParams } from 'react-router-dom';
import { Can, PageHeader } from 'ui-modules';

export const TasksPage = () => {
  const { teamId } = useParams();
  const { pathname } = useLocation();

  const basePath = teamId
    ? `/operation/team/${teamId}/tasks`
    : `/operation/tasks`;

  const isCreatedView = pathname === '/operation/tasks/created';

  return (
    <>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              {teamId && (
                <>
                  <TeamBreadCrumb />
                  <Separator.Inline />
                </>
              )}
              <TaskBreadCrump link={basePath} />
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>
        <Can action="taskCreate">
          <AddTaskSheet />
        </Can>
      </PageHeader>
      <div className="flex overflow-hidden w-full h-full">
        <div className="flex flex-col overflow-hidden w-full h-full">
          <PageSubHeader>
            <TasksFilter />
            <TasksViewControl />
          </PageSubHeader>
          <TasksView isCreatedView={isCreatedView} />
        </div>
        {<TasksSideWidget />}
      </div>
    </>
  );
};
