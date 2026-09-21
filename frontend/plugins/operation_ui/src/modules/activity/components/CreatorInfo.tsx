import { ITask } from '@/task/types';
import { IProject } from '@/project/types';
import { ActivityTimelineItem } from '@/activity/components/ActivityTimelineItem';
import { ITriage } from '@/triage/types/triage';
import { useTranslation } from 'react-i18next';
import { ActivityActor } from '@/activity/components/ActivityActor';

interface CreatorInfoProps {
  contentDetail: ITask | IProject | ITriage;
}

export const CreatorInfo = ({ contentDetail }: CreatorInfoProps) => {
  const { t } = useTranslation('operation');

  return (
    <ActivityActor.Provider actorId={contentDetail.createdBy}>
      <ActivityTimelineItem
        avatar={<ActivityActor.Avatar />}
        createdAt={contentDetail.createdAt?.toLocaleString()}
        id={contentDetail._id}
      >
        {t('created-by')} <ActivityActor.Name />
      </ActivityTimelineItem>
    </ActivityActor.Provider>
  );
};
