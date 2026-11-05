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
      <div className="inline-flex min-w-0 max-w-full flex-wrap items-center gap-x-1 gap-y-1">
        {t('added-cycle')}
        <span className="min-w-0 max-w-full font-medium">
          <CycleInline cycleId={metadata?.newValue} />
        </span>
      </div>
    );
  }
  return (
    <div className="inline-flex min-w-0 max-w-full flex-wrap items-center gap-x-1 gap-y-1">
      {t('changed-cycle')}
      <span className="min-w-0 max-w-full font-medium">
        <CycleInline cycleId={metadata?.previousValue} />
      </span>
      {t('to')}
      <span className="min-w-0 max-w-full font-medium">
        <CycleInline cycleId={metadata?.newValue} />
      </span>
    </div>
  );
};
