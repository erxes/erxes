import { useTranslation } from 'react-i18next';

export const usePeriodLabel = (days: number) => {
  const { t } = useTranslation('loyalty');

  return days
    ? t('dashboard.last-days', { count: days })
    : t('dashboard.all-time');
};
