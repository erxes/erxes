import type { NotificationChannelContentProps } from '~/widgets/notifications/my-inbox/types/notificationContent';
import { IconChalkboard, IconExternalLink } from '@tabler/icons-react';
import { Button, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useChannel } from '~/widgets/notifications/my-inbox/hooks/useChannel';
import { ChannelEventMetadata } from '~/widgets/notifications/my-inbox/components/ChannelEventMetadata';
import { ChannelUnavailable } from '~/widgets/notifications/my-inbox/components/ChannelUnavailable';
import { getUserDisplayName } from '~/widgets/notifications/my-inbox/utils/getUserDisplayName';

export const NotificationChannelContent = ({
  action,
  createdAt,
  fromUser,
  fromUserId,
  contentTypeId,
  message,
  title,
}: NotificationChannelContentProps) => {
  const { t } = useTranslation('frontline');
  const { channelDetail, loading, error } = useChannel(contentTypeId || '');

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center">
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
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-6 py-8">
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

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" asChild>
          <Link to={`/frontline/settings/channels/${channelDetail._id}`}>
            <IconExternalLink className="size-4" />
            {t('open-channel', 'Open channel')}
          </Link>
        </Button>
        {fromUserId && (
          <Button variant="secondary" asChild>
            <Link to={`/settings/team/members?user_id=${fromUserId}`}>
              {t('view-user', {
                defaultValue: 'View {{name}}',
                name: getUserDisplayName(fromUser),
              })}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};
