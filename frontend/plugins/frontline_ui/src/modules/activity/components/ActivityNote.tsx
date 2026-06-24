import { IActivity } from '@/activity/types';
import { useTranslation } from 'react-i18next';
export const ActivityNote = ({
  action,
}: {
  action: IActivity['action'];
}) => {
  const { t } = useTranslation('frontline');
  return <div className="lowercase">{t('activity-note', { action })}</div>;
};
