import { ITask } from '@/task/types';
import { IProject } from '@/project/types';
import { ActivityTimelineItem } from '@/activity/components/ActivityTimelineItem';
import { ITriage } from '@/triage/types/triage';
import { useTranslation } from 'react-i18next';
import { ActivityActor } from '@/activity/components/ActivityActor';
import { IconBrandGithub } from '@tabler/icons-react';
import { isGithubTriage } from '@/operation/utils/isGithubTriage';

interface CreatorInfoProps {
  contentDetail: ITask | IProject | ITriage;
}

export const CreatorInfo = ({ contentDetail }: CreatorInfoProps) => {
  const { t } = useTranslation('operation');
  const githubTriage = isGithubTriage(contentDetail);

  return (
    <ActivityActor.Provider actorId={contentDetail.createdBy}>
      <ActivityTimelineItem
        avatar={
          githubTriage ? (
            <IconBrandGithub className="size-4" />
          ) : (
            <ActivityActor.Avatar />
          )
        }
        createdAt={contentDetail.createdAt?.toLocaleString()}
        id={contentDetail._id}
      >
        {githubTriage ? (
          t('created-from-github-issue')
        ) : (
          <>
            {t('created-by')} <ActivityActor.Name />
          </>
        )}
      </ActivityTimelineItem>
    </ActivityActor.Provider>
  );
};
