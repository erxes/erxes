import { Breadcrumb, PageSubHeader } from 'erxes-ui';
import { useParams, useLocation } from 'react-router-dom';

import { FavoriteToggleIconButton, PageHeader } from 'ui-modules';
import { AddTaskSheet } from '@/task/components/add-task/AddTaskSheet';
import { Separator } from 'erxes-ui';
import { TaskBreadCrump } from '@/task/components/breadcrump/TaskBreadCrump';
import { TeamBreadCrumb } from '@/team/components/breadcrumb/TeamBreadCrumb';
import { TasksFilter } from '@/task/components/TasksFilter';
import { TasksView, TasksViewControl } from '@/task/components/TasksView';
import { TasksSideWidget } from '@/task/components/detail/TasksSideWidget';

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
              <Separator.Inline />
              <FavoriteToggleIconButton />
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>
        <AddTaskSheet />
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
