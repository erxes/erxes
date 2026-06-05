import { PageSubHeader } from 'erxes-ui';
import { TasksFilter } from '@/task/components/TasksFilter';
import { TasksView, TasksViewControl } from '@/task/components/TasksView';
import { Export, Import } from 'ui-modules';
import { useTasksVariables } from '@/task/hooks/useGetTasks';

export const TasksLayout = () => {
  const variables = useTasksVariables();

  const getFilters = () => {
    const { cursor, limit, orderBy, direction, ...filters } = variables;
    return filters;
  };

  return (
    <div className="flex flex-col overflow-hidden w-full h-full">
      <PageSubHeader>
        <TasksFilter />
        <TasksViewControl />
        <Import
          pluginName="operation"
          moduleName="task"
          collectionName="tasks"
        />
        <Export
          pluginName="operation"
          moduleName="task"
          collectionName="tasks"
          getFilters={getFilters}
        />
      </PageSubHeader>
      <TasksView />
    </div>
  );
};
