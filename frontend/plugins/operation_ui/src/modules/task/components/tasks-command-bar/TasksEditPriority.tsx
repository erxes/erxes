import { IconAlertSquareRounded, IconChevronRight } from '@tabler/icons-react';
import { Command } from 'erxes-ui';

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

export const TasksEditPriorityContent = () => {
  return <div>TasksEditPriorityContent</div>;
};
