import { ChannelHotKeyScope } from '@/channels/types';
import { useCanAddChannelMembers } from '@/channels/hooks/useCanAddChannelMembers';
import { CHANNEL_MEMBERS_CONTENT_TYPE } from '@/settings/constants/recordPanels';
import { IconPlus } from '@tabler/icons-react';
import { Button, Kbd, useScopedHotkeys } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSidePanel } from 'ui-modules';

export const AddMembers = ({ channelId }: { channelId: string }) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });
  const { openRecord } = useSidePanel();
  const canAdd = useCanAddChannelMembers(channelId);
  const onOpen = () => {
    if (canAdd)
      openRecord({
        contentType: CHANNEL_MEMBERS_CONTENT_TYPE,
        contentId: channelId,
      });
  };
  useScopedHotkeys('c', onOpen, ChannelHotKeyScope.ChannelMembersPage);
  if (!canAdd) return null;
  return (
    <Button onClick={onOpen}>
      <IconPlus />
      {t('add-members', 'Add members')}
      <Kbd>C</Kbd>
    </Button>
  );
};
