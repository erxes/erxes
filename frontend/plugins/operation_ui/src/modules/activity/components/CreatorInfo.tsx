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

  const renderAvatar = () => {
    if (githubTriage) {
      return <IconBrandGithub className="size-4" />;
    }

    if (discordReport) {
      return <IconBrandDiscord className="size-4" />;
    }

    return <ActivityActor.Avatar />;
  };

  const renderLabel = () => {
    if (githubTriage) {
      return t('created-from-github-issue');
    }

    if (discordReport) {
      return t('created-from-discord', {
        defaultValue: 'Reported in Discord by @{{username}}',
        username: discordReport.discordSource.username,
      });
    }

    return (
      <>
        {t('created-by')} <ActivityActor.Name />
      </>
    );
  };

  return (
    <ActivityActor.Provider actorId={contentDetail.createdBy}>
      <ActivityTimelineItem
        avatar={renderAvatar()}
        createdAt={contentDetail.createdAt?.toLocaleString()}
        id={contentDetail._id}
      >
        {renderLabel()}
      </ActivityTimelineItem>
    </ActivityActor.Provider>
  );
};
