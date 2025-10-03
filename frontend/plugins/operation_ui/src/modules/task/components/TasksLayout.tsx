import { PageSubHeader } from 'erxes-ui';
import { TasksFilter } from '@/task/components/TasksFilter';
import { TasksView, TasksViewControl } from '@/task/components/TasksView';

export const TasksLayout = () => {
  return (
    <div className="flex flex-col overflow-hidden w-full h-full">
      <PageSubHeader>
        <TasksFilter />
        <TasksViewControl />
      </PageSubHeader>
      <TasksView />
    </div>
  );
};
