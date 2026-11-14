import { useMutation } from '@apollo/client';
import { REMOVE_CHANNEL } from '../graphql/mutations';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { CHANNEL_CONTENT_TYPE } from '@/settings/constants/recordPanels';
import { useCloseRemovedSettingsRecord } from '@/settings/hooks/useCloseRemovedSettingsRecord';

export const useChannelRemove = () => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });
  const closeRemovedRecord =
    useCloseRemovedSettingsRecord(CHANNEL_CONTENT_TYPE);
  const [removeChannel, { loading, error }] = useMutation(REMOVE_CHANNEL, {
    onCompleted: (data) => {
      closeRemovedRecord(data.channelRemove?._id);
      toast({ title: t('channel-removed', 'Channel removed successfully') });
    },
    refetchQueries: ['frontlineChannelList'],
  });
  return { removeChannel, loading, error };
};
