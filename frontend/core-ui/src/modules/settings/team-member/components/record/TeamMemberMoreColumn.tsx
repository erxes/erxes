import { Cell } from '@tanstack/react-table';
import { useSetAtom } from 'jotai';
import { useSearchParams } from 'react-router-dom';
import { RecordTable, Spinner, toast, useQueryState } from 'erxes-ui';
import { IUser } from '@/settings/team-member/types';
import { renderingTeamMemberResetPasswordAtom } from '@/settings/team-member/states/teamMemberDetailStates';
import { Popover, Command, Combobox } from 'erxes-ui';
import {
  IconEdit,
  IconLock,
  IconRefresh,
  IconSettings,
  IconToggleLeft,
  IconToggleRight,
} from '@tabler/icons-react';
import { useResendInvite } from '../../hooks/useResendInvite';
import { useUsersStatusEdit } from '../../hooks/useUserEdit';
export const TeamMemberMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IUser, unknown>;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [, setResetPasswordOpen] = useQueryState('reset_password_id');

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

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item value="edit" onSelect={handleEdit}>
              <IconEdit /> Edit
            </Command.Item>
            <Command.Item value="permissions" onSelect={handleEditPermissions}>
              <IconSettings size={18} /> Edit Permission Groups
            </Command.Item>
            <Command.Item
              value="reset-password"
              onSelect={() => {
                setResetPasswordOpen(_id);
                setRenderingTeamMemberResetPasswordAtom(true);
              }}
            >
              <IconLock /> Reset Password
            </Command.Item>
            <Command.Item
              value="toggle-status"
              onSelect={() => {
                editStatus({
                  variables: {
                    _id,
                  },
                  onCompleted: () =>
                    toast({
                      title: `User ${
                        isActive ? 'deactivated' : 'activated'
                      } successfully`,
                      variant: 'success',
                    }),
                  onError: (error) =>
                    toast({ title: error.message, variant: 'destructive' }),
                });
              }}
            >
              <div className="flex items-center gap-2">
                {isActive ? (
                  <IconToggleLeft size={18} />
                ) : (
                  <IconToggleRight size={18} />
                )}
                {isActive ? 'Deactivate' : 'Activate'}
              </div>
            </Command.Item>
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
                      title: 'Invitation has been resent',
                      variant: 'success',
                    }),
                })
              }
            >
              <div className="flex items-center gap-2">
                {loading ? <Spinner size="sm" /> : <IconRefresh size={18} />}
                Resend Invite
              </div>
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const teamMemberMoreColumn = {
  id: 'more',
  cell: TeamMemberMoreColumnCell,
  size: 33,
};
