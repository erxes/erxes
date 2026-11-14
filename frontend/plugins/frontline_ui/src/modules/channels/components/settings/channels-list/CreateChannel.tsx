import { channelCreateSheetOpenState } from '@/channels/states';
import { ChannelHotKeyScope } from '@/channels/types';
import { CHANNEL_CONTENT_TYPE } from '@/settings/constants/recordPanels';
import { IconPlus } from '@tabler/icons-react';
import { Button, Kbd, useScopedHotkeys } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSidePanel } from 'ui-modules';

/** Opens channel creation from its button, shortcut, or shared create state. */
export const CreateChannel = ({
  isIconOnly = false,
}: {
  isIconOnly?: boolean;
}) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });
  const { openNewRecord } = useSidePanel();
  const [open, setOpen] = useAtom(channelCreateSheetOpenState);
  /** Starts a new team-channel record panel. */
  const onOpen = () => openNewRecord(CHANNEL_CONTENT_TYPE, {});
  useEffect(() => {
    if (open) {
      openNewRecord(CHANNEL_CONTENT_TYPE, {});
      setOpen(false);
    }
  }, [open, openNewRecord, setOpen]);
  useScopedHotkeys('c', onOpen, ChannelHotKeyScope.ChannelSettingsPage);
  return (
    <Button
      onClick={onOpen}
      variant={isIconOnly ? 'ghost' : 'default'}
      size={isIconOnly ? 'icon' : 'default'}
    >
      <IconPlus />
      {!isIconOnly && (
        <>
          <span>{t('create-channel', 'Create channel')}</span>
          <Kbd>C</Kbd>
        </>
      )}
    </Button>
  );
};
