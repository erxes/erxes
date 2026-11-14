import type { User } from '@erxes/core-contract';
import { IconEdit, IconMailForward } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import type { RecordTableColumnDef } from 'erxes-ui';
import { Combobox, Command, Popover, RecordTable, useToast } from 'erxes-ui';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { useCan } from '~/modules/auth/session';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOpenMemberPanel } from '../details/useMemberPanel';
import { useMemberPermissions } from '../useTeamMembers';

const TeamMemberMoreColumnCell = ({ user }: { user: User }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const [menuOpen, setMenuOpen] = useState(false);
  const openPanel = useOpenMemberPanel();
  const permissions = useMemberPermissions(user);
  const can = useCan();
  const { toast } = useToast();

  const resend = useMutation(
    orpc.users.resendInvitation.mutationOptions({
      onSuccess: () => toast({ title: t('invitation-resent', 'Invitation sent again') }),
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: t('invitation-failed', 'Could not send the invitation'),
          description: messageOf(error),
        }),
    }),
  );

  const handleEdit = () => {
    openPanel(user.id);
    setMenuOpen(false);
  };

  return (
    <Popover open={menuOpen} onOpenChange={setMenuOpen}>
      {permissions?.canEdit && (
        <Popover.Trigger render={<RecordTable.MoreButton className="w-full h-full" />} />
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
                  resend.mutate({ id: user.id });
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

export const teamMemberMoreColumn: RecordTableColumnDef<User> = {
  id: 'more',
  header: () => <RecordTable.ColumnSelector />,
  cell: ({ row }) => <TeamMemberMoreColumnCell user={row.original} />,
  size: 33,
};
