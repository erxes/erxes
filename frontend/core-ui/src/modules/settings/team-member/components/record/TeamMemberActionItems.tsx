import { LdapMemberMenuItem } from '@/settings/ldap/components/LdapMemberMenuItem';
import { useLdapLinkedUserIds } from '@/settings/ldap/hooks/useLdapUserLink';
import { useResendInvite } from '@/settings/team-member/hooks/useResendInvite';
import { useUsersStatusEdit } from '@/settings/team-member/hooks/useUserEdit';
import { renderingTeamMemberResetPasswordAtom } from '@/settings/team-member/states/teamMemberDetailStates';
import { IUser } from '@/settings/team-member/types';
import {
  IconHistory,
  IconLock,
  IconPrinter,
  IconRefresh,
  IconSettings,
  IconToggleLeft,
  IconToggleRight,
} from '@tabler/icons-react';
import { Command, Spinner, toast, useQueryState } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { Can } from 'ui-modules';

export const TEAM_MEMBER_ACTION_PERMISSIONS = [
  'documentsRead',
  'permissionsManage',
  'teamMembersInvite',
  'teamMembersResetPassword',
  'teamMembersRemove',
  'broadcastUpdate',
];

export const TeamMemberActionItems = ({
  user,
  onPrint,
  onEditPermissions,
  onOpenActivityLog,
  onAction,
}: {
  user: Pick<IUser, '_id' | 'email' | 'isActive'>;
  onPrint: () => void;
  onEditPermissions: () => void;
  onOpenActivityLog: () => void;
  onAction?: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const [, setResetPasswordOpen] = useQueryState('reset_password_id');
  const setRenderingResetPassword = useSetAtom(
    renderingTeamMemberResetPasswordAtom,
  );
  const { resend, loading } = useResendInvite();
  const { editStatus } = useUsersStatusEdit();
  const { _id, email, isActive } = user;
  const { isLinked } = useLdapLinkedUserIds();

  const select = (action: () => void) => () => {
    action();
    onAction?.();
  };

  return (
    <Command.List>
      <Can action="permissionsManage">
        <Command.Item value="permissions" onSelect={select(onEditPermissions)}>
          <IconSettings size={18} /> {t('edit-permission-groups')}
        </Command.Item>
      </Can>
      {!isLinked(_id) && (
        <Can action="teamMembersResetPassword">
          <Command.Item
            value="reset-password"
            onSelect={select(() => {
              setResetPasswordOpen(_id);
              setRenderingResetPassword(true);
            })}
          >
            <IconLock /> {t('reset-password')}
          </Command.Item>
        </Can>
      )}
      <LdapMemberMenuItem userId={_id} onDone={() => onAction?.()} />
      <Can action="teamMembersRemove">
        <Command.Item
          value="toggle-status"
          onSelect={select(() =>
            editStatus({
              variables: { _id },
              onCompleted: () =>
                toast({
                  title: isActive
                    ? t('user-deactivated-successfully')
                    : t('user-activated-successfully'),
                  variant: 'success',
                }),
              onError: (error) =>
                toast({ title: error.message, variant: 'destructive' }),
            }),
          )}
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
          onSelect={select(() =>
            resend({
              variables: { email },
              onError: (error) =>
                toast({ title: error.message, variant: 'destructive' }),
              onCompleted: () =>
                toast({ title: t('invitation-resent'), variant: 'success' }),
            }),
          )}
        >
          {loading ? <Spinner size="sm" /> : <IconRefresh size={18} />}
          {t('resend-invite')}
        </Command.Item>
      </Can>
      <Can action="broadcastUpdate">
        <Command.Item
          value="activity-log"
          onSelect={select(onOpenActivityLog)}
        >
          <IconHistory /> {t('activity-log')}
        </Command.Item>
      </Can>
      <Can action="documentsRead">
        <Command.Item
          value="print"
          className="text-primary"
          onSelect={select(onPrint)}
        >
          <IconPrinter /> {t('print', 'Print')}
        </Command.Item>
      </Can>
    </Command.List>
  );
};
