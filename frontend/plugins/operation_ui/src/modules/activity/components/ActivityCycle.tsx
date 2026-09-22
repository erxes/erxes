import { ACTIVITY_ACTIONS } from '@/activity/constants';
import { IActivity } from '@/activity/types';
import { CycleInline } from '@/cycle/components/CycleInline';
import { useTranslation } from 'react-i18next';

export const ActivityCycle = ({
  metadata,
  action,
}: {
  metadata: IActivity['metadata'];
  action: IActivity['action'];
}) => {
  const { t } = useTranslation('operation');

  if (action === ACTIVITY_ACTIONS.CREATED) {
    return (
      <div className="inline-flex items-center gap-1">
        {t('added-cycle')}
        <span className="font-bold">
          <CycleInline cycleId={metadata.newValue} />
        </span>
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-1">
      {t('changed-cycle')}
      <span className="font-bold">
        <CycleInline cycleId={metadata.previousValue || ''} />
      </span>
      {t('to')}
      <span className="font-bold">
        <CycleInline cycleId={metadata.newValue} />
      </span>
    </div>
  );
};
