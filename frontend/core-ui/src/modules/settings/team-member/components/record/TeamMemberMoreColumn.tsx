import { renderingTeamMemberResetPasswordAtom } from '@/settings/team-member/states/teamMemberDetailStates';
import { IUser } from '@/settings/team-member/types';
import {
  IconEdit,
  IconHistory,
  IconLock,
  IconRefresh,
  IconSettings,
  IconToggleLeft,
  IconToggleRight,
} from '@tabler/icons-react';
import { Cell } from '@tanstack/react-table';
import {
  Combobox,
  Command,
  Popover,
  RecordTable,
  Spinner,
  toast,
  useQueryState,
} from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Can } from 'ui-modules';
import { TeamMemberActivityLogSheet } from '../TeamMemberActivityLogSheet';
import { useResendInvite } from '../../hooks/useResendInvite';
import { useUsersStatusEdit } from '../../hooks/useUserEdit';
import { useTranslation } from 'react-i18next';

export const TeamMemberMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IUser, unknown>;
}): JSX.Element => {
  const [activityLogOpen, setActivityLogOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [, setResetPasswordOpen] = useQueryState('reset_password_id');
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });

  const setRenderingTeamMemberResetPasswordAtom = useSetAtom(
    renderingTeamMemberResetPasswordAtom,
  );
  const { email, _id, isActive } = cell.row.original;
  const { resend, loading } = useResendInvite();
  const { editStatus } = useUsersStatusEdit();

  const handleEditPermissions = () => {
    const next = new URLSearchParams(searchParams);
    next.set('user_id', _id);
    next.set('tab', 'permissions');
    setSearchParams(next);
  };

  const handleEdit = () => {
    const next = new URLSearchParams(searchParams);
    next.set('user_id', _id);
    next.set('tab', 'overview');
    setSearchParams(next);
  };

  const menuItems = (
    <Command.List>
      <Can action="teamMembersUpdate">
        <Command.Item value="edit" onSelect={handleEdit}>
          <IconEdit /> {t('edit')}
        </Command.Item>
      </Can>
      <Can action="permissionsManage">
        <Command.Item value="permissions" onSelect={handleEditPermissions}>
          <IconSettings size={18} /> {t('edit-permission-groups')}
        </Command.Item>
      </Can>
      <Can action="teamMembersResetPassword">
        <Command.Item
          value="reset-password"
          onSelect={() => {
            setResetPasswordOpen(_id);
            setRenderingTeamMemberResetPasswordAtom(true);
          }}
        >
          <IconLock /> {t('reset-password')}
        </Command.Item>
      </Can>
      <Can action="teamMembersRemove">
        <Command.Item
          value="toggle-status"
          onSelect={() => {
            editStatus({
              variables: {
                _id,
              },
              onCompleted: () =>
                toast({
                  title: isActive
                    ? t('user-deactivated-successfully')
                    : t('user-activated-successfully'),
                  variant: 'success',
                }),
              onError: (error) =>
                toast({ title: error.message, variant: 'destructive' }),
            });
          }}
        >
          {isActive ? (
            <IconToggleLeft size={18} />
          ) : (
            <IconToggleRight size={18} />
          )}
          {isActive ? t('deactivate') : t('activate')}
        </Command.Item>
      </Can>
      <Can action="teamMembersInvite">
        <Command.Item
          value="status"
          onSelect={() =>
            resend({
              variables: {
                email,
              },
              onError: (error) =>
                toast({ title: error.message, variant: 'destructive' }),
              onCompleted: () =>
                toast({
                  title: t('invitation-resent'),
                  variant: 'success',
                }),
            })
          }
        >
          {loading ? <Spinner size="sm" /> : <IconRefresh size={18} />}
          {t('resend-invite')}
        </Command.Item>
      </Can>
      <Can action="broadcastUpdate">
        <Command.Item
          value="activity-log"
          onSelect={() => {
            setMenuOpen(false);
            setActivityLogOpen(true);
          }}
        >
          <IconHistory /> {t('activity-log')}
        </Command.Item>
      </Can>
    </Command.List>
  );

  return (
    <Popover open={menuOpen} onOpenChange={setMenuOpen}>
      <Can
        actions={[
          'permissionsManage',
          'teamMembersInvite',
          'teamMembersResetPassword',
          'teamMembersUpdate',
          'teamMembersRemove',
          'broadcastUpdate',
        ]}
      >
        <Popover.Trigger asChild>
          <RecordTable.MoreButton className="w-full h-full" />
        </Popover.Trigger>
      </Can>
      <Combobox.Content>
        <Command shouldFilter={false}>{menuItems}</Command>
      </Combobox.Content>
      <Can action="broadcastUpdate">
        <TeamMemberActivityLogSheet
          email={email}
          open={activityLogOpen}
          onOpenChange={setActivityLogOpen}
        />
      </Can>
    </Popover>
  );
};

export const teamMemberMoreColumn = {
  id: 'more',
  header: () => <RecordTable.ColumnSelector />,
  cell: TeamMemberMoreColumnCell,
  size: 33,
};
