import { cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TSessionState } from '@/settings/team-member/sessions/types';

/** Green: used in the last 10 minutes. Gray: signed in but idle. None: signed out. */
export const MemberPresenceDot = ({ state }: { state?: TSessionState }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });

  if (!state || state === 'none') return null;

  const label = t(state === 'active' ? 'presence-active' : 'presence-idle');

  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={cn(
        'absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-background',
        state === 'active' ? 'bg-success' : 'bg-muted-foreground/60',
      )}
    />
  );
};
