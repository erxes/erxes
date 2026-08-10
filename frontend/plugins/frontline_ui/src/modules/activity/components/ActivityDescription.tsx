import { useTranslation } from 'react-i18next';

export const ActivityDescription = () => {
  const { t } = useTranslation('frontline');
  return <div className="flex items-center gap-1">{t('changed-the-description')}</div>;
};
