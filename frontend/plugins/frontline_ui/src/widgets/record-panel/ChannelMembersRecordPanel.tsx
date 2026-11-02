import { ChannelMembersAddForm } from '@/channels/components/settings/members/ChannelMembersAddForm';
import { useCanAddChannelMembers } from '@/channels/hooks/useCanAddChannelMembers';
import { useGetChannel } from '@/channels/hooks/useGetChannel';
import { useGetChannelMembers } from '@/channels/hooks/useGetChannelMembers';
import { useChannelPanelHotkeys } from '@/channels/hooks/useChannelPanelHotkeys';
import { SettingsPanelForm } from '@/settings/components/SettingsPanelForm';
import { Empty, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ActivityLogs, type IRecordPanelProps } from 'ui-modules';

const MembersPanelForm = ({ channelId }: { channelId: string }) => {
  useChannelPanelHotkeys();
  return (
    <SettingsPanelForm>
      <ChannelMembersAddForm channelId={channelId} />
    </SettingsPanelForm>
  );
};

export const ChannelMembersRecordPanel = ({
  contentId,
  view,
}: IRecordPanelProps) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });
  const { channel, loading, error } = useGetChannel({
    variables: { id: contentId },
  });
  const { loading: membersLoading } = useGetChannelMembers({
    channelIds: [contentId],
  });
  const canAdd = useCanAddChannelMembers(contentId);
  if (view === 'title') return t('add-members', 'Add members');
  if (view === 'actions') return null;
  if (loading || membersLoading) return <Spinner containerClassName="py-12" />;
  if (!channel || channel.scope === 'personal' || !canAdd)
    return (
      <Empty>
        <Empty.Header>
          <Empty.Title>{t('not-found', 'Not found')}</Empty.Title>
          <Empty.Description>{error?.message}</Empty.Description>
        </Empty.Header>
      </Empty>
    );
  if (view === 'activity')
    return <ActivityLogs targetId={contentId} showInternalNotes={false} />;
  return <MembersPanelForm key={contentId} channelId={contentId} />;
};
