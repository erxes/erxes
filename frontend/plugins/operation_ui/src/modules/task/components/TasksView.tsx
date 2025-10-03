import { Button, Popover, PopoverScoped, ToggleGroup } from 'erxes-ui';
import {
  IconAdjustmentsHorizontal,
  IconLayoutKanban,
  IconTable,
} from '@tabler/icons-react';
import { useAtom, useAtomValue } from 'jotai';
import { tasksViewAtom } from '@/task/states/tasksViewState';
import { lazy, Suspense, useState } from 'react';
import { TaskDetailSheet } from '@/task/components/TaskDetailSheet';
import { useParams } from 'react-router-dom';

const TasksRecordTable = lazy(() =>
  import('@/task/components/TasksRecordTable').then((mod) => ({
    default: mod.TasksRecordTable,
  })),
);

const TasksBoard = lazy(() =>
  import('@/task/components/TasksBoard').then((mod) => ({
    default: mod.TasksBoard,
  })),
);

export const TasksViewControl = () => {
  const { teamId } = useParams();
  const [view, setView] = useAtom(tasksViewAtom);
  const [isOpen, setIsOpen] = useState(false);

  if (!teamId) {
    return null;
  }

  return (
    <PopoverScoped open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <Button variant="ghost">
          <IconAdjustmentsHorizontal />
          View
        </Button>
      </Popover.Trigger>
      <Popover.Content>
        <ToggleGroup
          type="single"
          defaultValue="list"
          className="grid grid-cols-2 gap-2"
          value={view}
          onValueChange={(value) => {
            setView(value as 'list' | 'grid');
            setIsOpen(false);
          }}
        >
          <ToggleGroup.Item value="list" asChild>
            <Button
              variant="secondary"
              size="lg"
              className="h-11 flex-col gap-0"
            >
              <IconTable className="!size-5" />
              <span className="text-xs font-normal">List</span>
            </Button>
          </ToggleGroup.Item>
          <ToggleGroup.Item value="grid" asChild>
            <Button
              variant="secondary"
              size="lg"
              className="h-11 flex-col gap-0"
            >
              <IconLayoutKanban className="!size-5" />
              <span className="text-xs font-normal">Board</span>
            </Button>
          </ToggleGroup.Item>
        </ToggleGroup>
      </Popover.Content>
    </PopoverScoped>
  );
};

export const TasksView = () => {
  const view = useAtomValue(tasksViewAtom);
  const { teamId } = useParams();

  return (
    <Suspense>
      {view === 'list' || !teamId ? <TasksRecordTable /> : <TasksBoard />}
      <TaskDetailSheet />
    </Suspense>
  );
};
