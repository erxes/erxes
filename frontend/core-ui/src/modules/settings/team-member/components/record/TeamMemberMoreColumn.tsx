import { IUser } from '@/settings/team-member/types';
import { IconEdit } from '@tabler/icons-react';
import { Cell } from '@tanstack/react-table';
import { Combobox, Command, Popover, RecordTable } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Can } from 'ui-modules';

export const TeamMemberMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IUser, unknown>;
}): JSX.Element => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { _id } = cell.row.original;

  const handleEdit = () => {
    const next = new URLSearchParams(searchParams);
    next.set('user_id', _id);
    next.set('tab', 'overview');
    setSearchParams(next);
    setMenuOpen(false);
  };

  return (
    <Popover open={menuOpen} onOpenChange={setMenuOpen}>
      <Can action="teamMembersUpdate">
        <Popover.Trigger asChild>
          <RecordTable.MoreButton className="w-full h-full" />
        </Popover.Trigger>
      </Can>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item value="edit" onSelect={handleEdit}>
              <IconEdit /> {t('edit')}
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const teamMemberMoreColumn = {
  id: 'more',
  header: () => <RecordTable.ColumnSelector />,
  cell: TeamMemberMoreColumnCell,
  size: 33,
};
