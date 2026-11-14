import { CHANNEL_CONTENT_TYPE } from '@/settings/constants/recordPanels';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSidePanel } from 'ui-modules';

/** Opens the selected channel in its settings record panel. */
export const ChannelEditButton = ({ channelId }: { channelId: string }) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });
  const { openRecord } = useSidePanel();
  return (
    <Button
      variant="secondary"
      onClick={() =>
        openRecord({ contentType: CHANNEL_CONTENT_TYPE, contentId: channelId })
      }
    >
      {t('edit', 'Edit')}
    </Button>
  );
};
