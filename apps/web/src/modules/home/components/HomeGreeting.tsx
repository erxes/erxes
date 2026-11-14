import { useFormat } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useMinuteClock } from '~/lib/useMinuteClock';
import { useSession } from '~/modules/auth/session';

const getGreetingKey = (hour: number) => {
  if (hour < 12) {
    return 'good-morning';
  }

  return hour < 18 ? 'good-afternoon' : 'good-evening';
};

export const HomeGreeting = () => {
  const { user } = useSession();
  const { t } = useTranslation('common', { keyPrefix: 'home' });
  const fmt = useFormat();
  const now = new Date(useMinuteClock());
  // Greets by first name, the first word of the full name.
  const name = user.fullName?.trim().split(/\s+/)[0] || user.username || user.email;

  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{fmt.date(now, 'EEEE, MMMM d')}</p>
      <h1 className="text-2xl font-semibold tracking-tight">
        {t(getGreetingKey(now.getHours()), { name })}
      </h1>
      <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
    </div>
  );
};
