import type { NotificationTeamContentProps } from '~/widgets/notifications/my-inbox/types/notificationContent';
import { useGetTeam } from '@/team/hooks/useGetTeam';
import { IconInfoCircle, IconUsersGroup } from '@tabler/icons-react';
import { Empty, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { NotificationOpenButton } from '~/widgets/notifications/my-inbox/components/NotificationOpenButton';
import { TeamEventMetadata } from '~/widgets/notifications/my-inbox/components/TeamEventMetadata';

export const NotificationTeamContent = ({
  action,
  contentTypeId,
  createdAt,
  fromUser,
  message,
}: NotificationTeamContentProps) => {
  const { t } = useTranslation('operation');
  const { team, loading, error } = useGetTeam(contentTypeId);

  if (loading) {
    return <Spinner containerClassName="min-h-full" />;
  }

  if (error || !team) {
    const missingTeam = !error;
    const title = missingTeam
      ? t('team-not-found', 'Team not found')
      : t('failed-to-load-team', 'Failed to load team');
    const description = missingTeam
      ? t(
          'team-no-longer-available',
          'This team may have been removed or is no longer available.',
        )
      : error.message;

    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <Empty>
          <Empty.Header>
            <Empty.Media variant="icon">
              <IconInfoCircle />
            </Empty.Media>
            <Empty.Title>{title}</Empty.Title>
            <Empty.Description>{description}</Empty.Description>
          </Empty.Header>
        </Empty>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-6 py-8">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b pb-6">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-muted-foreground">
            <IconUsersGroup className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t('team', 'Team')}
            </p>
            <h2 className="mt-1 break-words text-2xl font-semibold text-foreground">
              {team.name}
            </h2>
            <TeamEventMetadata
              action={action}
              createdAt={createdAt}
              fromUser={fromUser}
            />
          </div>
        </div>
        <NotificationOpenButton
          to={`/operation/settings/team/details/${team._id}`}
        >
          {t('open-team', 'Open team')}
        </NotificationOpenButton>
      </header>

      <div className="grid gap-6 py-6 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t('members', 'Members')}
          </p>
          <p className="mt-1 text-sm text-foreground">{team.memberCount}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t('tasks', 'Tasks')}
          </p>
          <p className="mt-1 text-sm text-foreground">{team.taskCount}</p>
        </div>
      </div>

      <p className="border-t py-6 text-sm leading-6 text-muted-foreground">
        {team.description || message}
      </p>
    </div>
  );
};
