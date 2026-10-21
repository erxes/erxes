import { IActivity } from '@/activity/types';
import { useTranslation } from 'react-i18next';
export const ActivityNote = ({ action }: { action: IActivity['action'] }) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.activity' });
  return (
    <div className="lowercase">
      {t('activity-note', '{{action}} note', { action })}
    </div>
  );
};
