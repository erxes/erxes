import { MembersInline } from 'ui-modules';
import { ITicket } from '@/ticket/types';
import { ActivityTimelineItem } from '@/activity/components/ActivityTimelineItem';
import { IconUser } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface CreatorInfoProps {
  contentDetail: ITicket;
}

export const CreatorInfo = ({ contentDetail }: CreatorInfoProps) => {
  const { t } = useTranslation('frontline');
  const memberIds = contentDetail.createdBy ? [contentDetail.createdBy] : [];
  const hasCreator = Boolean(contentDetail.createdBy);

  return (
    <ActivityTimelineItem
      avatar={
        hasCreator ? (
          <MembersInline.Provider memberIds={memberIds}>
            <MembersInline.Avatar />
          </MembersInline.Provider>
        ) : (
          <div className="size-5 rounded-full bg-muted flex items-center justify-center">
            <IconUser className="size-3 text-muted-foreground" />
          </div>
        )
      }
      createdAt={contentDetail.createdAt?.toLocaleString()}
      id={contentDetail._id}
    >
      {t('created-by')}{' '}
      {hasCreator ? (
        <MembersInline.Provider memberIds={memberIds}>
          <MembersInline.Title className="font-semibold" />
        </MembersInline.Provider>
      ) : (
        <span className="text-muted-foreground">{t('unknown')}</span>
      )}
    </ActivityTimelineItem>
  );
};
