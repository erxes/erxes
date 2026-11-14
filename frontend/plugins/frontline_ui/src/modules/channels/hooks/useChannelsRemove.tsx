import { useBulkRemove } from '@/channels/hooks/useBulkRemove';
import { useMutation } from '@apollo/client';
import { REMOVE_CHANNEL } from '../graphql/mutations';
import { CHANNEL_CONTENT_TYPE } from '@/settings/constants/recordPanels';
import { useCloseRemovedSettingsRecord } from '@/settings/hooks/useCloseRemovedSettingsRecord';

export const useChannelsRemove = () => {
  const closeRemovedRecord =
    useCloseRemovedSettingsRecord(CHANNEL_CONTENT_TYPE);
  const [removeChannel] = useMutation(REMOVE_CHANNEL, {
    onCompleted: (data) => closeRemovedRecord(data.channelRemove?._id),
  });
  const { bulkRemove, loading } = useBulkRemove(['frontlineChannelList']);

  const removeChannels = (channelIds: string[]) =>
    bulkRemove(channelIds, (id) => removeChannel({ variables: { id } }));

  return { removeChannels, loading };
};
