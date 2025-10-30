import { SelectPriority } from '@/operation/components/SelectPriority';
import { IconAlertSquareRounded, IconChevronRight } from '@tabler/icons-react';
import { Command } from 'erxes-ui';
import { useUpdateTask } from '@/task/hooks/useUpdateTask';

export const TasksEditPriorityTrigger = ({
  setCurrentContent,
}: {
  setCurrentContent: (currentContent: string) => void;
}) => {
  return (
    <Command.Item
      className="flex justify-between"
      onSelect={() => {
        setCurrentContent('priority');
      }}
    >
      <div className="flex gap-2 items-center">
        <IconAlertSquareRounded className="size-4" />
        Change Priority
      </div>
      <IconChevronRight />
    </Command.Item>
  );
};

export const TasksEditPriorityContent = ({
  taskIds,
  setOpen,
}: {
  taskIds: string[];
  setOpen: (open: boolean) => void;
}) => {
  const { updateTask } = useUpdateTask();

  if (!taskIds) return null;
  return (
    <SelectPriority.Provider
      onValueChange={(value) => {
        taskIds.forEach((taskId) => {
          updateTask({
            variables: {
              _id: taskId,
              priority: value,
            },
            onCompleted: () => {
              setOpen(false);
            },
          });
        });
      }}
    >
      <SelectPriority.Content />
    </SelectPriority.Provider>
  );
};
