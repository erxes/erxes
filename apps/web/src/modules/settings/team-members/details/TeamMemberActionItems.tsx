import type { User } from '@erxes/core-contract';
import {
  IconLock,
  IconLogin,
  IconLogout,
  IconToggleLeft,
  IconToggleRight,
} from '@tabler/icons-react';
import { Command, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useMemberPermissions, useTeamMemberDisable, useTeamMemberSignIn } from '../useTeamMembers';

/**
 * A member's actions: reset password and deactivate / activate.
 */
export const TeamMemberActionItems = ({
  user,
  onAction,
  onResetPassword,
}: {
  user: User;
  onAction?: () => void;
  onResetPassword: () => void;
}) => {
  const { t } = useTranslation('workspace', { keyPrefix: 'team-member' });
  const toggle = useTeamMemberDisable();
  const signIn = useTeamMemberSignIn();
  const permissions = useMemberPermissions(user);
  const isActive = user.status !== 'disabled';

  const select = (action: () => void) => () => {
    action();
    onAction?.();
  };

  return (
    <Command.List>
      <Command.Group
        heading={t('access-and-security', 'Access and security')}
        className="[&:not(:has([cmdk-item]))]:hidden"
      >
        {permissions?.canSetPassword && (
          <Command.Item value="reset-password" onSelect={select(onResetPassword)}>
            <IconLock /> {t('reset-password')}
          </Command.Item>
        )}
        {permissions?.canChangeSignIn && (
          <Command.Item
            value="sign-in"
            onSelect={select(() => signIn.mutate({ id: user.id, allow: !user.canSignIn }))}
          >
            {user.canSignIn ? <IconLogout /> : <IconLogin />}
            {user.canSignIn
              ? t('stop-sign-in', 'Keep on the team without sign-in')
              : t('allow-sign-in', 'Invite to sign in')}
          </Command.Item>
        )}
        {permissions?.canToggle && (
          <Command.Item
            value="toggle-status"
            variant={isActive ? 'destructive' : 'default'}
            onSelect={select(() => toggle.mutate({ id: user.id, disabled: isActive }))}
          >
            {toggle.isPending ? (
              <Spinner size="sm" />
            ) : isActive ? (
              <IconToggleLeft size={18} />
            ) : (
              <IconToggleRight size={18} />
            )}
            {isActive ? t('deactivate') : t('activate')}
          </Command.Item>
        )}
      </Command.Group>
    </Command.List>
  );
};
