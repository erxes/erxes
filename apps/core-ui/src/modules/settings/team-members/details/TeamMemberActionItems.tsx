import type { User } from '@erxes/core-contract';
import { IconLock, IconToggleLeft, IconToggleRight } from '@tabler/icons-react';
import { Command, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { RESET_PASSWORD_QUERY_KEY } from '../constants';
import { useMemberPermissions, useTeamMemberDisable } from '../useTeamMembers';

/**
 * A member's actions (old `TeamMemberActionItems`), the ones core has:
 * reset password and deactivate / activate.
 */
export const TeamMemberActionItems = ({
  user,
  onAction,
}: {
  user: User;
  onAction?: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const [, setSearchParams] = useSearchParams();
  const toggle = useTeamMemberDisable();
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
          <Command.Item
            value="reset-password"
            onSelect={select(() =>
              setSearchParams((previous) => {
                const next = new URLSearchParams(previous);

                next.set(RESET_PASSWORD_QUERY_KEY, user.id);
                return next;
              }),
            )}
          >
            <IconLock /> {t('reset-password')}
          </Command.Item>
        )}
        {permissions?.canToggle && (
          <Command.Item
            value="toggle-status"
            className={isActive ? 'text-destructive' : undefined}
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
