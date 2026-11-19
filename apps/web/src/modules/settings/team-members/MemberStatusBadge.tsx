import type { User } from '@erxes/core-contract';
import { Badge, type BadgeProps } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

/**
 * A member's status as a badge: deactivated, no sign-in, not verified, or verified once they can
 * sign in. `dot` and `size` go to the badge.
 */
export const MemberStatusBadge = ({
  user,
  ...badge
}: { user: Pick<User, 'status' | 'canSignIn'> } & Pick<BadgeProps, 'dot' | 'size'>) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });

  if (user.status === 'disabled')
    return (
      <Badge variant="secondary" {...badge}>
        {t('deactivated', 'Deactivated')}
      </Badge>
    );

  if (!user.canSignIn)
    return (
      <Badge variant="muted" {...badge}>
        {t('no-sign-in', 'No sign-in')}
      </Badge>
    );

  return (
    <Badge variant={user.status === 'invited' ? 'destructive' : 'success'} {...badge}>
      {user.status === 'invited' ? t('not-verified') : t('verified', 'Verified')}
    </Badge>
  );
};
