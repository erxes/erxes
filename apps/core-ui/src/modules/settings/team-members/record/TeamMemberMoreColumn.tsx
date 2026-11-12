import type { User } from '@erxes/core-contract';
import { IconEdit, IconMailForward } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import type { Cell, ColumnDef } from '@tanstack/react-table';
import { Combobox, Command, Popover, RecordTable, useToast } from 'erxes-ui';
import { api, messageOf } from '~/lib/api';
import { useCan } from '~/modules/auth/session';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOpenMemberPanel } from '../details/useMemberPanel';
import { useMemberPermissions } from '../useTeamMembers';

export const TeamMemberMoreColumnCell = ({ cell }: { cell: Cell<User, unknown> }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const [menuOpen, setMenuOpen] = useState(false);
  const openPanel = useOpenMemberPanel();
  const user = cell.row.original;
  const permissions = useMemberPermissions(user);
  const can = useCan();
  const { toast } = useToast();
  const resend = useMutation({
    mutationFn: () => api.users.resendInvitation({ id: user.id }),
    onSuccess: () => toast({ title: t('invitation-resent', 'Invitation sent again') }),
    onError: (error) =>
      toast({
        variant: 'destructive',
        title: t('invitation-failed', 'Could not send the invitation'),
        description: messageOf(error),
      }),
  });

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
            {user.status === 'invited' && can('team.invite') && (
              <Command.Item
                value="resend"
                onSelect={() => {
                  resend.mutate();
                  setMenuOpen(false);
                }}
              >
                <IconMailForward /> {t('resend-invitation', 'Send the invitation again')}
              </Command.Item>
            )}
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
