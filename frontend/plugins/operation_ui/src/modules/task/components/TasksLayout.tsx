import { PageSubHeader } from 'erxes-ui';
import { TASK_DATE_RANGE_KEYS } from '@/task/utils/dateFilters';
import { TasksFilter } from '@/task/components/TasksFilter';
import { TasksView, TasksViewControl } from '@/task/components/TasksView';
import { useTasksVariables } from '@/task/hooks/useGetTasks';
import { Can, Export, Import } from 'ui-modules';

/** Renders the import button for the tasks list. */
export const TasksImportButton = () => {
  return (
    <Can action="taskImportManage">
      <Import
        pluginName="operation"
        moduleName="task"
        collectionName="task"
        title="Import Tasks"
      />
    </Can>
  );
};

/** Renders the export button for the tasks list, wired up to the current filter state. */
export const TasksExportButton = () => {
  const variables = useTasksVariables();

  /** Returns the active filter values from the current tasks query variables. */
  const getFilters = () => {
    const rawFilters: Record<string, unknown> = variables;
    const filters: Record<string, unknown> = {};

    const directKeys = [
      'name',
      'assigneeId',
      'teamId',
      'status',
      'projectId',
      'cycleId',
      'milestoneId',
      'createdBy',
      ...TASK_DATE_RANGE_KEYS,
    ];

    for (const key of directKeys) {
      if (rawFilters[key]) {
        filters[key] = rawFilters[key];
      }
    }

    if (rawFilters.priority != null) {
      filters.priority = rawFilters.priority;
    }
    if (rawFilters.statusType != null) {
      filters.statusType = rawFilters.statusType;
    }
    if (Array.isArray(rawFilters.tagIds) && rawFilters.tagIds.length) {
      filters.tagIds = rawFilters.tagIds;
    }

    return filters;
  };

  return (
    <Can action="taskExportManage">
      <Export
        pluginName="operation"
        moduleName="task"
        collectionName="task"
        getFilters={getFilters}
        buttonVariant="outline"
      />
    </Can>
  );
};

export const TasksLayout = () => {
  return (
    <div className="flex flex-col overflow-hidden w-full h-full">
      <PageSubHeader>
        <TasksFilter />
        <TasksImportButton />
        <TasksExportButton />
        <TasksViewControl />
      </PageSubHeader>
      <TasksView />
    </div>
  );
};
