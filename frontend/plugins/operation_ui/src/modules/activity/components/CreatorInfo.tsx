import { MembersInline } from 'ui-modules';
import { ITask } from '@/task/types';
import { IProject } from '@/project/types';
import { ActivityTimelineItem } from '@/activity/components/ActivityTimelineItem';
import { IconUser } from '@tabler/icons-react';
import { ITriage } from '@/triage/types/triage';
import { useTranslation } from 'react-i18next';

interface CreatorInfoProps {
  contentDetail: ITask | IProject | ITriage;
}

export const CreatorInfo = ({ contentDetail }: CreatorInfoProps) => {
  const { t } = useTranslation('operation');
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
          <MembersInline.Title />
        </MembersInline.Provider>
      ) : (
        <span className="text-muted-foreground">{t('unknown')}</span>
      )}
    </ActivityTimelineItem>
  );
};
