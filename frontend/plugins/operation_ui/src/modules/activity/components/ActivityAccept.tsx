import { ACTIVITY_ACTIONS } from '@/activity/constants';
import { IActivity } from '@/activity/types';
import { useTranslation } from 'react-i18next';

export const ActivityAccept = ({ action }: { action: IActivity['action'] }) => {
  const { t } = useTranslation('operation');

  if (action !== ACTIVITY_ACTIONS.ACCEPTED) return null;

  return (
    <span>
      {t('accepted-triage', {
        defaultValue: 'accepted this triage as a task',
      })}
    </span>
  );
};
