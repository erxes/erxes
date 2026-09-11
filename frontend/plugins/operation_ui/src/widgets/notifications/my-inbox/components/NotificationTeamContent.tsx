import { useGetTeam } from '@/team/hooks/useGetTeam';
import { IconInfoCircle, IconUsersGroup } from '@tabler/icons-react';
import {
  Avatar,
  Button,
  Empty,
  RelativeDateDisplay,
  Spinner,
  readImage,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { TNotification } from 'ui-modules';

const getUserDisplayName = (fromUser: TNotification['fromUser']) =>
  fromUser?.details?.fullName || fromUser?.email || 'Unknown user';

export const NotificationTeamContent = ({
  action,
  contentTypeId,
  createdAt,
  fromUser,
  message,
}: TNotification) => {
  const { t } = useTranslation('operation');
  const { team, loading, error } = useGetTeam({
    variables: { _id: contentTypeId || '' },
    skip: !contentTypeId,
  });

  if (loading) {
    return <Spinner containerClassName="min-h-dvh" />;
  }

  if (error || !team) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6">
        <Empty>
          <Empty.Header>
            <Empty.Media variant="icon">
              <IconInfoCircle />
            </Empty.Media>
            <Empty.Title>
              {error
                ? t('failed-to-load-team', 'Failed to load team')
                : t('team-not-found', 'Team not found')}
            </Empty.Title>
            <Empty.Description>
              {error?.message ||
                t(
                  'team-no-longer-available',
                  'This team may have been removed or is no longer available.',
                )}
            </Empty.Description>
          </Empty.Header>
        </Empty>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-6 py-8">
      <header className="flex items-start gap-4 border-b pb-6">
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
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {fromUser && (
              <span className="flex items-center gap-1.5">
                <Avatar className="size-5">
                  <Avatar.Image
                    src={readImage(fromUser.details?.avatar || '')}
                    alt={getUserDisplayName(fromUser)}
                  />
                  <Avatar.Fallback className="text-[10px]">
                    {getUserDisplayName(fromUser)[0].toUpperCase()}
                  </Avatar.Fallback>
                </Avatar>
                {getUserDisplayName(fromUser)}
              </span>
            )}
            {action && <span>{action}</span>}
            {createdAt && <RelativeDateDisplay.Value value={createdAt} />}
          </div>
        </div>
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

      <div>
        <Button variant="secondary" asChild>
          <Link to={`/settings/operation/team/details/${team._id}`}>
            {t('open-team', 'Open team')}
          </Link>
        </Button>
      </div>
    </div>
  );
};
