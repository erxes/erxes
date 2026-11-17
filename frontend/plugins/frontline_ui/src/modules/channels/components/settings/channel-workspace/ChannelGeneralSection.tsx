import { UpdateChannelForm } from '@/channels/components/settings/channel-details/UpdateChannelForm';
import { useCanManageChannels } from '@/channels/hooks/useCanManageChannels';
import { useChannelDelete } from '@/channels/hooks/useChannelDelete';
import { TWorkspaceChannel } from '@/channels/components/settings/channel-workspace/ChannelWorkspaceNav';
import { useGetChannel } from '@/channels/hooks/useGetChannel';
import { useGetPersonalChannel } from '@/channels/hooks/useGetPersonalChannel';
import { IconLock, IconTrash } from '@tabler/icons-react';
import { Button, Spinner } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

const GeneralBlock = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) => (
  <section className="flex flex-col gap-3">
    <div>
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    {children}
  </section>
);

const ChannelDangerZone = ({
  channelId,
  channelName,
}: {
  channelId: string;
  channelName: string;
}) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });
  const { deleteChannel, loading } = useChannelDelete();

  return (
    <div className="flex items-center gap-4 rounded-lg border border-destructive/30 p-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">
          {t('delete-channel', 'Delete channel')}
        </p>
        <p className="text-xs text-muted-foreground">
          {t(
            'delete-channel-hint',
            'Permanently removes {{name}} for everyone. This cannot be undone.',
            { name: channelName },
          )}
        </p>
      </div>
      <Button
        variant="destructive"
        disabled={loading}
        onClick={() => deleteChannel(channelId)}
      >
        {loading ? <Spinner size="sm" /> : <IconTrash />}
        {t('delete', 'Delete')}
      </Button>
    </div>
  );
};

export const ChannelGeneralSection = ({
  channel,
  description,
  deletable,
}: {
  channel: TWorkspaceChannel;
  description: string;
  deletable: boolean;
}) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });
  const canManage = useCanManageChannels([channel._id]);
  const editable = canManage(channel._id);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-8 py-8">
        <GeneralBlock title={t('general', 'General')} description={description}>
          {!editable && (
            <p className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              <IconLock className="size-4 shrink-0" />
              {t(
                'channel-read-only',
                'Only the workspace owner and channel admins can edit this channel.',
              )}
            </p>
          )}
          <UpdateChannelForm
            key={channel._id}
            channel={channel}
            readOnly={!editable}
          />
        </GeneralBlock>
        {editable && deletable && (
          <GeneralBlock
            title={t('danger-zone', 'Danger zone')}
            description={t(
              'danger-zone-description',
              'Actions here affect everyone in the channel.',
            )}
          >
            <ChannelDangerZone
              channelId={channel._id}
              channelName={channel.name}
            />
          </GeneralBlock>
        )}
      </div>
    </div>
  );
};

export const TeamChannelGeneralSection = () => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });
  const { id } = useParams<{ id: string }>();
  const { channel } = useGetChannel({
    variables: id ? { id } : undefined,
    skip: !id,
  });

  if (!channel) return <Spinner containerClassName="flex-1" />;

  return (
    <ChannelGeneralSection
      channel={channel}
      deletable
      description={t(
        'general-description',
        'How this channel appears in the inbox, tickets and reports.',
      )}
    />
  );
};

export const PersonalChannelGeneralSection = () => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });
  const { channel } = useGetPersonalChannel();

  if (!channel) return <Spinner containerClassName="flex-1" />;

  return (
    <ChannelGeneralSection
      channel={channel}
      deletable={false}
      description={t(
        'personal-channel-description',
        'Your private inbox. Only you can see its conversations.',
      )}
    />
  );
};
