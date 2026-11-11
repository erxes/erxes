import type { User } from '@erxes/core-contract';
import { IconEdit } from '@tabler/icons-react';
import type { Cell, ColumnDef } from '@tanstack/react-table';
import { Combobox, Command, Popover, RecordTable } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOpenMemberPanel } from '../details/useMemberPanel';
import { useMemberPermissions } from '../useTeamMembers';

const TeamMemberMoreColumnCell = ({ cell }: { cell: Cell<User, unknown> }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const [menuOpen, setMenuOpen] = useState(false);
  const openPanel = useOpenMemberPanel();
  const user = cell.row.original;
  const permissions = useMemberPermissions(user);

  const handleEdit = () => {
    openPanel(user.id);
    setMenuOpen(false);
  };

  return (
    <Popover open={menuOpen} onOpenChange={setMenuOpen}>
      {permissions?.canEdit && (
        <Popover.Trigger asChild>
          <RecordTable.MoreButton className="w-full h-full" />
        </Popover.Trigger>
      )}
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

export const teamMemberMoreColumn: ColumnDef<User> = {
  id: 'more',
  header: () => <RecordTable.ColumnSelector />,
  cell: TeamMemberMoreColumnCell,
  size: 33,
};
