import { IconChevronRight, IconProgressCheck } from '@tabler/icons-react';
import { Command } from 'erxes-ui';

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

export const TasksEditStatusContent = () => {
  return <div>Edit status</div>;
};
