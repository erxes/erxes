import { ITicket } from '@/ticket/types';
import { ActivityTimelineItem } from '@/activity/components/ActivityTimelineItem';
import {
  ActivityAuthorAvatar,
  ActivityAuthorName,
} from '@/activity/components/ActivityAuthor';
import { useTranslation } from 'react-i18next';

interface CreatorInfoProps {
  contentDetail: ITicket;
}

export const CreatorInfo = ({ contentDetail }: CreatorInfoProps) => {
  const { t } = useTranslation('frontline');

  return (
    <ActivityTimelineItem
      avatar={<ActivityAuthorAvatar createdBy={contentDetail.createdBy} />}
      createdAt={contentDetail.createdAt?.toLocaleString()}
      id={contentDetail._id}
    >
      {t('created-by')}{' '}
      <ActivityAuthorName
        createdBy={contentDetail.createdBy}
        className="font-semibold"
      />
    </ActivityTimelineItem>
  );
};
