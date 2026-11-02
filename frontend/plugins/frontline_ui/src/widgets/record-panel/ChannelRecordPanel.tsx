import { ChannelCreateForm } from '@/channels/components/settings/channels-list/ChannelCreateForm';
import { UpdateChannelForm } from '@/channels/components/settings/channel-details/UpdateChannelForm';
import { useCanManageChannels } from '@/channels/hooks/useCanManageChannels';
import { useGetChannel } from '@/channels/hooks/useGetChannel';
import { useGetChannelMembers } from '@/channels/hooks/useGetChannelMembers';
import { useChannelPanelHotkeys } from '@/channels/hooks/useChannelPanelHotkeys';
import { IChannelDetail } from '@/channels/types';
import { SettingsPanelForm } from '@/settings/components/SettingsPanelForm';
import { Empty, Skeleton, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ActivityLogs, type IRecordPanelProps, useSidePanel } from 'ui-modules';

const ChannelPanelForm = ({ channel }: { channel?: IChannelDetail }) => {
  const { close } = useSidePanel();
  useChannelPanelHotkeys();
  return (
    <SettingsPanelForm>
      {channel ? (
        <UpdateChannelForm
          channel={channel}
          onCancel={close}
          onCompleted={close}
          panel
        />
      ) : (
        <ChannelCreateForm />
      )}
    </SettingsPanelForm>
  );
};

const ChannelPanelTitle = ({
  channel,
  loading,
}: {
  channel?: IChannelDetail;
  loading: boolean;
}) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });
  return loading && !channel ? (
    <Skeleton className="h-4 w-32" />
  ) : (
    channel?.name || t('create-channel', 'Create channel')
  );
};

const ChannelPanelUnavailable = ({ message }: { message?: string }) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });
  return (
    <Empty>
      <Empty.Header>
        <Empty.Title>{t('not-found', 'Not found')}</Empty.Title>
        <Empty.Description>{message}</Empty.Description>
      </Empty.Header>
    </Empty>
  );
};

export const ChannelRecordPanel = ({ contentId, view }: IRecordPanelProps) => {
  const isNew = contentId === 'new';
  const { channel, loading, error } = useGetChannel({
    variables: { id: contentId },
    skip: isNew,
  });
  const { loading: membersLoading } = useGetChannelMembers({
    channelIds: isNew ? [] : [contentId],
  });
  const canManage = useCanManageChannels(isNew ? [] : [contentId]);
  if (view === 'title')
    return <ChannelPanelTitle channel={channel} loading={loading} />;
  if (view === 'actions') return null;
  if (isNew)
    return view === 'activity' ? null : <ChannelPanelForm key={contentId} />;
  if (!channel)
    return loading || membersLoading ? (
      <Spinner containerClassName="py-12" />
    ) : (
      <ChannelPanelUnavailable message={error?.message} />
    );
  if (!canManage(contentId))
    return membersLoading ? (
      <Spinner containerClassName="py-12" />
    ) : (
      <ChannelPanelUnavailable />
    );
  if (view === 'activity')
    return <ActivityLogs targetId={contentId} showInternalNotes={false} />;
  return <ChannelPanelForm key={contentId} channel={channel} />;
};
