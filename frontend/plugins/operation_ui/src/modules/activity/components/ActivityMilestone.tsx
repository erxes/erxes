import { ACTIVITY_ACTIONS } from '@/activity/constants';
import { IActivity } from '@/activity/types';
import { MilestoneInline } from '@/project/components/milestone/MilestoneInline';
import { useTranslation } from 'react-i18next';

export const ActivityMilestone = ({
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
        {t('added-milestone')}
        <span className="min-w-0 max-w-full font-medium">
          <MilestoneInline milestoneId={metadata?.newValue} />
        </span>
      </div>
    );
  }

  if (action === ACTIVITY_ACTIONS.REMOVED) {
    return (
      <div className="inline-flex min-w-0 max-w-full flex-wrap items-center gap-x-1 gap-y-1">
        {t('removed-milestone')}
        <span className="min-w-0 max-w-full font-medium">
          <MilestoneInline milestoneId={metadata?.previousValue} />
        </span>
      </div>
    );
  }

  return null;
};
