import { IconLock } from '@tabler/icons-react';
import { Badge } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ApprovalLockState } from '../types';

type ApprovalLockedBadgeProps = {
  state?: ApprovalLockState;
};

export const ApprovalLockedBadge = ({ state }: ApprovalLockedBadgeProps) => {
  const { t } = useTranslation('approval');

  if (!state?.locked) {
    return null;
  }

  return (
    <Badge
      variant={state.hasAccess ? 'secondary' : 'warning'}
      className="gap-1"
    >
      <IconLock className="size-3" />
      {t('locked')}
    </Badge>
  );
};
