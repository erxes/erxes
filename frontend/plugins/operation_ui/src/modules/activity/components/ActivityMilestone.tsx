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
      <div className="inline-flex items-center gap-1">
        {t('added-milestone')}
        <span className="font-bold">
          <MilestoneInline milestoneId={metadata.newValue} />
        </span>
      </div>
    );
  }

  if (action === ACTIVITY_ACTIONS.REMOVED) {
    return (
      <div className="inline-flex items-center gap-1">
        {t('removed-milestone')}
        <span className="font-bold">
          <MilestoneInline milestoneId={metadata.previousValue || ''} />
        </span>
      </div>
    );
  }

  return <></>;
};
