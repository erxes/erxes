import { ACTIVITY_ACTIONS } from '@/activity/constants';
import { IActivity } from '@/activity/types';
import { useTranslation } from 'react-i18next';

export const ActivityEstimate = ({
  metadata,
  action,
}: {
  metadata: IActivity['metadata'];
  action: IActivity['action'];
}) => {
  const { t } = useTranslation('operation');

  if (action === ACTIVITY_ACTIONS.CREATED) {
    return (
      <div>
        {t('added-estimate-point')}{' '}
        <span className="font-bold">{metadata.newValue}</span>
      </div>
    );
  }
  return (
    <div>
      {t('changed-estimate-point')}{' '}
      <span className="font-bold">{metadata.previousValue}</span> {t('to')}{' '}
      <span className="font-bold">{metadata.newValue}</span>
    </div>
  );
};
