import { IconEdit } from '@tabler/icons-react';
import { Cell, ColumnDef } from '@tanstack/react-table';
import { Combobox, Command, Popover, RecordTable } from 'erxes-ui';
import { useProjectDetailSheet } from '@/project/hooks/useProjectDetailSheet';
import { IProject } from '../types';
import { useTranslation } from 'react-i18next';

export const ProjectsMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IProject, unknown>;
}) => {
  const { t } = useTranslation('operation');
  const [, setActiveProject] = useProjectDetailSheet();
  const { _id } = cell.row.original;

  const handleEdit = (projectId: string) => {
    setActiveProject(projectId);
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
              <IconEdit /> {t('edit')}
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const projectsMoreColumn: ColumnDef<IProject> = {
  id: 'more',
  header: () => <RecordTable.ColumnSelector />,
  cell: ProjectsMoreColumnCell,
  size: 33,
};
