import { IconChevronRight, IconUser } from '@tabler/icons-react';
import { Command } from 'erxes-ui';
import { SelectAssigneeTask } from '../task-selects/SelectAssigneeTask';
import { useParams } from 'react-router';
import { useUpdateTask } from '@/task/hooks/useUpdateTask';

export const TasksAssignToTrigger = ({
  setCurrentContent,
}: {
  setCurrentContent: (currentContent: string) => void;
}) => {
  return (
    <Command.Item
      className="w-full justify-between"
      onSelect={() => {
        setCurrentContent('assignee');
      }}
    >
      <div className="flex gap-2 items-center">
        <IconUser className="size-4" />
        Assign to
      </div>
      <IconChevronRight />
    </Command.Item>
  );
};

export const TasksAssignToContent = ({
  taskIds,
  setOpen,
}: {
  taskIds: string[];
  setOpen: (open: boolean) => void;
}) => {
  const { teamId } = useParams();
  const { updateTask } = useUpdateTask();
  return (
    <SelectAssigneeTask.Provider
      mode="single"
      value={''}
      onValueChange={async (value) => {
        await Promise.all(
          taskIds.map((taskId) =>
            updateTask({
              variables: {
                _id: taskId,
                assigneeId: value,
            },
          })
        ));
        setOpen(false);
      }}
    >
      <SelectAssigneeTask.Content
        exclude={false}
        teamIds={teamId && [teamId]}
      />
    </SelectAssigneeTask.Provider>
  );
};
