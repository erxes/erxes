import { Cell } from '@tanstack/react-table';
import { RecordTable } from 'erxes-ui';
import { useNavigate } from 'react-router-dom';

import { Popover, Command, Combobox } from 'erxes-ui';
import { IconEdit } from '@tabler/icons-react';
import { IProject } from '../types';

export const ProjectsMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IProject, unknown>;
}) => {
  const navigate = useNavigate();
  const { _id } = cell.row.original;

  const handleEdit = (projectId: string) => {
    navigate(`${projectId}/overview`);
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

export const projectsMoreColumn = {
  id: 'more',
  cell: ProjectsMoreColumnCell,
  size: 33,
};
