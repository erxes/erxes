import { ChannelMembersAddForm } from '@/channels/components/settings/members/ChannelMembersAddForm';
import { useChannelPanelHotkeys } from '@/channels/hooks/useChannelPanelHotkeys';
import { SettingsPanelForm } from '@/settings/components/SettingsPanelForm';
import { useTranslation } from 'react-i18next';
import { ActivityLogs, type IRecordPanelProps } from 'ui-modules';

/** Wraps the channel member form with settings panel layout and hotkeys. */
const MembersPanelForm = ({ channelId }: { channelId: string }) => {
  useChannelPanelHotkeys();
  return (
    <SettingsPanelForm>
      <ChannelMembersAddForm channelId={channelId} />
    </SettingsPanelForm>
  );
};

/** Renders the channel member panel's title, activity, or add-member form. */
export const ChannelMembersRecordPanel = ({
  contentId,
  view,
}: IRecordPanelProps) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });
  if (view === 'title') return t('add-members', 'Add members');
  if (view === 'actions') return null;
  if (view === 'activity')
    return <ActivityLogs targetId={contentId} showInternalNotes={false} />;
  return <MembersPanelForm key={contentId} channelId={contentId} />;
};
