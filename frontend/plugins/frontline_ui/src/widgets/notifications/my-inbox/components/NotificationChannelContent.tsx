import { IconChalkboard, IconInfoCircle } from '@tabler/icons-react';
import {
  Avatar,
  Button,
  Empty,
  RelativeDateDisplay,
  Spinner,
  readImage,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { TNotification } from 'ui-modules';
import { useChannel } from '~/widgets/notifications/my-inbox/hooks/useChannel';

const getUserDisplayName = (fromUser: TNotification['fromUser']) =>
  fromUser?.details?.fullName || fromUser?.email || 'Unknown user';

const ChannelEventMetadata = ({
  action,
  createdAt,
  fromUser,
}: Pick<TNotification, 'action' | 'createdAt' | 'fromUser'>) => {
  const actorName = getUserDisplayName(fromUser);

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
      {fromUser ? (
        <span className="flex items-center gap-1.5">
          <Avatar className="size-5">
            <Avatar.Image
              src={readImage(fromUser.details?.avatar || '')}
              alt={actorName}
            />
            <Avatar.Fallback className="text-[10px]">
              {actorName.slice(0, 1).toUpperCase()}
            </Avatar.Fallback>
          </Avatar>
          {actorName}
        </span>
      ) : null}
      {action ? <span>{action}</span> : null}
      {createdAt ? <RelativeDateDisplay.Value value={createdAt} /> : null}
    </div>
  );
};

const ChannelUnavailable = ({
  description,
  title,
}: {
  description: string;
  title: string;
}) => (
  <Empty className="min-h-dvh rounded-none border-0">
    <Empty.Header>
      <Empty.Media variant="icon">
        <IconInfoCircle />
      </Empty.Media>
      <Empty.Title>{title}</Empty.Title>
      <Empty.Description>{description}</Empty.Description>
    </Empty.Header>
  </Empty>
);

export const NotificationChannelContent = ({
  action,
  createdAt,
  fromUser,
  fromUserId,
  contentTypeId,
  message,
  title,
}: TNotification) => {
  const { t } = useTranslation('frontline');
  const { channelDetail, loading, error } = useChannel(contentTypeId || '');

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !channelDetail) {
    const unavailableTitle = error
      ? t('failed-to-load-channel', 'Failed to load channel')
      : t('channel-not-found', 'Channel not found');
    const unavailableDescription =
      error?.message ||
      t(
        'channel-no-longer-available',
        'This channel may have been removed or is no longer available.',
      );

    return (
      <ChannelUnavailable
        description={unavailableDescription}
        title={unavailableTitle}
      />
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-6 py-8">
      <header className="flex items-start gap-4 border-b pb-6">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-muted-foreground">
          <IconChalkboard className="size-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t('channel-label', 'Channel')}
          </p>
          <h2 className="mt-1 break-words text-2xl font-semibold text-foreground">
            {channelDetail.name}
          </h2>
          <ChannelEventMetadata
            action={action}
            createdAt={createdAt}
            fromUser={fromUser}
          />
        </div>
      </header>

      <section className="space-y-3 py-6">
        <h3 className="text-lg font-medium text-foreground">{title}</h3>
        <p className="text-sm leading-6 text-muted-foreground">{message}</p>
      </section>

      {fromUserId && (
        <div>
          <Button variant="secondary" asChild>
            <Link to={`/settings/team-member?user_id=${fromUserId}`}>
              {t('view-user', {
                defaultValue: 'View {{name}}',
                name: getUserDisplayName(fromUser),
              })}
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};
