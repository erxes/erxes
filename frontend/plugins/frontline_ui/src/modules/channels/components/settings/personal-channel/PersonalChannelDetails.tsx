import { UpdateChannelForm } from '@/channels/components/settings/channel-details/UpdateChannelForm';
import { useGetPersonalChannel } from '@/channels/hooks/useGetPersonalChannel';
import { IntegrationList } from '@/integrations/components/IntegrationList';
import { Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const PersonalChannelDetails = () => {
  const { t } = useTranslation('frontline');
  const { channel, loading, error } = useGetPersonalChannel();

  if (loading && !channel)
    return (
      <div className="w-full px-4 sm:px-8 lg:px-16 flex flex-col gap-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40 w-full" />
      </div>
    );

  if (error)
    return (
      <div className="w-full px-4 sm:px-8 lg:px-16">
        <p className="text-sm text-destructive">{error.message}</p>
      </div>
    );

  if (!channel)
    return (
      <div className="w-full px-4 sm:px-8 lg:px-16">
        <p className="text-sm text-accent-foreground">
          {t('no-personal-inbox')}
        </p>
      </div>
    );

  return (
    <div className="w-full px-4 sm:px-8 lg:px-16 pb-16 flex flex-col gap-4">
      <span className="flex flex-col gap-1 shrink-0">
        <h1 className="text-2xl font-semibold">{channel.name}</h1>
        <p className="text-sm text-muted-foreground">
          {t('personal-channel-description')}
        </p>
      </span>

      <div className="mt-4 w-full border border-muted-foreground/15 rounded-md shrink-0">
        <section className="w-full p-4">
          <UpdateChannelForm channel={channel} />
        </section>
      </div>

      {/* No member section: a personal channel has exactly one member and the
          API rejects any attempt to add another. */}
      <IntegrationList
        channelId={channel._id}
        heading={t('personal-integrations')}
      />
    </div>
  );
};
