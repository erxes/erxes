import { IconChevronRight, IconClipboard } from '@tabler/icons-react';
import { Command } from 'erxes-ui';
import { SelectProject } from '@/task/components/task-selects/SelectProjectTask';
import { useUpdateTask } from '@/task/hooks/useUpdateTask';
export const TasksAddProjectTrigger = ({
  setCurrentContent,
}: {
  setCurrentContent: (currentContent: string) => void;
}) => {
  return (
    <Command.Item
      className="flex justify-between"
      onSelect={() => {
        setCurrentContent('project');
      }}
    >
      <div className="flex gap-2 items-center">
        <IconClipboard className="size-4" />
        Add Project
      </div>
      <IconChevronRight />
    </Command.Item>
  );
};

export const TasksAddProjectContent = ({
  taskIds,
  setOpen,
}: {
  taskIds: string[];
  setOpen: (open: boolean) => void;
}) => {
  const { updateTask } = useUpdateTask();
  return (
    <SelectProject.Provider
      onValueChange={(value) => {
        taskIds.forEach((taskId) => {
          updateTask({
            variables: {
              _id: taskId,
              projectId: value,
            },
            onCompleted: () => {
              setOpen(false);
            },
          });
        });
      }}
    >
      <SelectProject.Content></SelectProject.Content>
    </SelectProject.Provider>
  );
};
