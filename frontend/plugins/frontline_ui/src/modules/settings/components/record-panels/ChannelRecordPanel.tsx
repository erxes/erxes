import { ChannelCreateForm } from '@/channels/components/settings/channels-list/ChannelCreateForm';
import { UpdateChannelForm } from '@/channels/components/settings/channel-details/UpdateChannelForm';
import { useGetChannel } from '@/channels/hooks/useGetChannel';
import { useChannelPanelHotkeys } from '@/channels/hooks/useChannelPanelHotkeys';
import { IChannelDetail } from '@/channels/types';
import { SettingsPanelForm } from '@/settings/components/SettingsPanelForm';
import { Empty, Skeleton, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ActivityLogs, type IRecordPanelProps, useSidePanel } from 'ui-modules';

/** Wraps channel creation or editing with panel layout and hotkeys. */
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
        />
      ) : (
        <ChannelCreateForm />
      )}
    </SettingsPanelForm>
  );
};

/** Shows a channel name, loading placeholder, or create/missing title. */
const ChannelPanelTitle = ({
  channel,
  loading,
  isNew,
}: {
  channel?: IChannelDetail;
  loading: boolean;
  isNew: boolean;
}) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });
  if (loading && !channel) return <Skeleton className="h-4 w-32" />;
  if (channel) return channel.name;
  return isNew
    ? t('create-channel', 'Create channel')
    : t('not-found', 'Not found');
};

/** Shows the empty state for an unavailable channel record. */
const ChannelPanelUnavailable = () => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });
  return (
    <Empty>
      <Empty.Header>
        <Empty.Title>{t('not-found', 'Not found')}</Empty.Title>
      </Empty.Header>
    </Empty>
  );
};

/** Loads a channel and renders its requested settings panel view. */
export const ChannelRecordPanel = ({ contentId, view }: IRecordPanelProps) => {
  const isNew = contentId === 'new';
  const { channel, loading } = useGetChannel({
    variables: { id: contentId },
    skip: isNew,
  });
  if (view === 'title')
    return (
      <ChannelPanelTitle channel={channel} loading={loading} isNew={isNew} />
    );
  if (view === 'actions') return null;
  if (isNew)
    return view === 'activity' ? null : <ChannelPanelForm key={contentId} />;
  if (!channel)
    return loading ? (
      <Spinner containerClassName="py-12" />
    ) : (
      <ChannelPanelUnavailable />
    );
  if (view === 'activity')
    return <ActivityLogs targetId={contentId} showInternalNotes={false} />;
  return <ChannelPanelForm key={contentId} channel={channel} />;
};
