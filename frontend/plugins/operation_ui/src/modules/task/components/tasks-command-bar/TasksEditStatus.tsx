import { IconChevronRight, IconProgressCheck } from '@tabler/icons-react';
import { Command } from 'erxes-ui';
import { SelectStatusTask } from '@/task/components/task-selects/SelectStatusTask';
import { useParams } from 'react-router';
import { useUpdateTask } from '@/task/hooks/useUpdateTask';

export const TasksEditStatusTrigger = ({
  setCurrentContent,
}: {
  setCurrentContent: (currentContent: string) => void;
}) => {
  return (
    <Command.Item
      className="flex justify-between"
      onSelect={() => {
        setCurrentContent('status');
      }}
    >
      <div className="flex gap-2 items-center">
        <IconProgressCheck className="size-4" />
        Change Status
      </div>
      <IconChevronRight />
    </Command.Item>
  );
};

export const TasksEditStatusContent = ({
  taskIds,
  setOpen,
}: {
  taskIds: string[];
  setOpen: (open: boolean) => void;
}) => {
  const { teamId } = useParams<{ teamId: string }>();
  const { updateTask } = useUpdateTask();
  if (!teamId) return null;
  return (
    <SelectStatusTask.Provider
      teamId={teamId}
      value=""
      onValueChange={(value) => {
        taskIds.forEach((taskId) => {
          updateTask({
            variables: {
              _id: taskId,
              status: value,
            },
            onCompleted: () => {
              setOpen(false);
            },
          });
        });
      }}
    >
      <SelectStatusTask.Content />
    </SelectStatusTask.Provider>
  );
};
