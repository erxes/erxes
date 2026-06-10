import { PageSubHeader } from 'erxes-ui';
import { TasksFilter } from '@/task/components/TasksFilter';
import { TasksView, TasksViewControl } from '@/task/components/TasksView';
import { Export, Import } from 'ui-modules';
import { useTasksVariables } from '@/task/hooks/useGetTasks';

export const TasksLayout = () => {
  const variables = useTasksVariables();

  /** Extracts export filters from variables by excluding pagination and sort parameters. */
  const getFilters = () => {
    const filters = { ...variables } as any;
    delete filters.cursor;
    delete filters.limit;
    delete filters.orderBy;
    delete filters.direction;
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
