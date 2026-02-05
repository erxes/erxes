import { Cell } from '@tanstack/react-table';
import { RecordTable } from 'erxes-ui';

import { Popover, Command, Combobox } from 'erxes-ui';
import { IconEdit } from '@tabler/icons-react';
import { ITask } from '@/task/types';
import { taskDetailSheetState } from '@/task/states/taskDetailSheetState';
import { useSetAtom } from 'jotai';

export const TasksMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ITask, unknown>;
}) => {
  const setActiveTask = useSetAtom(taskDetailSheetState);
  const { _id } = cell.row.original;

  const handleEdit = (taskId: string) => {
    setActiveTask(taskId);
  };

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item value="edit" onSelect={() => handleEdit(_id)}>
              <IconEdit /> Edit
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const tasksMoreColumn = {
  id: 'more',
  cell: TasksMoreColumnCell,
  size: 33,
};
