import { Command } from 'erxes-ui';
import { SelectPriority } from '@/operation/components/SelectPriority';
import { useUpdateProject } from '@/project/hooks/useUpdateProject';

export const ProjectsChangePriorityTrigger = ({
  setCurrentContent,
}: {
  setCurrentContent: (currentContent: string) => void;
}) => {
  return (
    <Command.Item
      onSelect={() => {
        setCurrentContent('priority');
      }}
    >
      <div className="flex gap-2 items-center">Change Priority</div>
    </Command.Item>
  );
};

export const ProjectsChangePriorityContent = ({
  projectIds,
  setOpen,
}: {
  projectIds: string[];
  setOpen: (open: boolean) => void;
}) => {
  const { updateProject } = useUpdateProject();
  return (
    <SelectPriority.Provider
      onValueChange={async (value) => {
        await Promise.all(
          projectIds.map((projectId) => {
            return updateProject({
              variables: {
                _id: projectId,
                priority: value,
              },
            });
          }),
        );
        setOpen(false);
      }}
    >
      <SelectPriority.Content />
    </SelectPriority.Provider>
  );
};
