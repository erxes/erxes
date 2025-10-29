import { IconChevronRight, IconClipboard } from '@tabler/icons-react';
import { Command } from 'erxes-ui';

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

export const TasksAddProjectContent = () => {
  return <div>Add Projects</div>;
};
