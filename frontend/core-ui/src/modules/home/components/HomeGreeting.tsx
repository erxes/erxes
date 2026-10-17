import { currentUserState } from 'ui-modules';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';

const getGreetingKey = (hour: number) => {
  if (hour < 12) {
    return 'good-morning';
  }

  return hour < 18 ? 'good-afternoon' : 'good-evening';
};

export const HomeGreeting = () => {
  const currentUser = useAtomValue(currentUserState);
  const { t, i18n } = useTranslation('common', { keyPrefix: 'home' });
  const now = new Date();
  const name =
    currentUser?.details?.firstName ||
    currentUser?.details?.fullName ||
    currentUser?.email ||
    '';

  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">
        {now.toLocaleDateString(i18n.language, {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })}
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">
        {t(getGreetingKey(now.getHours()), { name })}
      </h1>
      <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
    </div>
  );
};
