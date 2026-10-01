import { ITask } from '@/task/types';
import { IProject } from '@/project/types';
import { ActivityTimelineItem } from '@/activity/components/ActivityTimelineItem';
import { ITriage } from '@/triage/types/triage';
import { useTranslation } from 'react-i18next';
import { ActivityActor } from '@/activity/components/ActivityActor';
import { IconBrandGithub } from '@tabler/icons-react';

interface CreatorInfoProps {
  contentDetail: ITask | IProject | ITriage;
}

export const CreatorInfo = ({ contentDetail }: CreatorInfoProps) => {
  const { t } = useTranslation('operation');
  const githubTriage =
    contentDetail.createdBy === 'system' &&
    'githubIssueUrl' in contentDetail &&
    typeof contentDetail.status === 'number' &&
    contentDetail.githubIssueUrl &&
    typeof contentDetail.githubIssueNumber === 'number';

  if (githubTriage) {
    return (
      <ActivityTimelineItem
        avatar={<IconBrandGithub className="size-4" />}
        createdAt={contentDetail.createdAt?.toLocaleString()}
        id={contentDetail._id}
      >
        {t('created-from-github-issue', {
          defaultValue: 'Created from GitHub issue',
        })}
      </ActivityTimelineItem>
    );
  }

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
