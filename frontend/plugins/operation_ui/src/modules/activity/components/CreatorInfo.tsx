import { ITaskDetail } from '@/task/types';
import { IProject } from '@/project/types';
import { ActivityTimelineItem } from '@/activity/components/ActivityTimelineItem';
import { ITriageDetail } from '@/triage/types/triage';
import { useTranslation } from 'react-i18next';
import { ActivityActor } from '@/activity/components/ActivityActor';
import { IconBrandDiscord, IconBrandGithub } from '@tabler/icons-react';
import { isGithubTriage } from '@/operation/utils/isGithubTriage';
import { isDiscordReported } from '@/operation/utils/isDiscordReported';

interface CreatorInfoProps {
  contentDetail: ITaskDetail | IProject | ITriageDetail;
}

export const CreatorInfo = ({ contentDetail }: CreatorInfoProps) => {
  const { t } = useTranslation('operation');
  const githubTriage = isGithubTriage(contentDetail);
  const discordReport = isDiscordReported(contentDetail) ? contentDetail : null;

  return (
    <ActivityActor.Provider actorId={contentDetail.createdBy}>
      <ActivityTimelineItem
        avatar={
          githubTriage ? (
            <IconBrandGithub className="size-4" />
          ) : discordReport ? (
            <IconBrandDiscord className="size-4" />
          ) : (
            <ActivityActor.Avatar />
          )
        }
        createdAt={contentDetail.createdAt?.toLocaleString()}
        id={contentDetail._id}
      >
        {githubTriage ? (
          t('created-from-github-issue')
        ) : discordReport ? (
          t('created-from-discord', {
            defaultValue: 'Reported in Discord by @{{username}}',
            username: discordReport.discordSource.username,
          })
        ) : (
          <>
            {t('created-by')} <ActivityActor.Name />
          </>
        )}
      </ActivityTimelineItem>
    </ActivityActor.Provider>
  );
};
