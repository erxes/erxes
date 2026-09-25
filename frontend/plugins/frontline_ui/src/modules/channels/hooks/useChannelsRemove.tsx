import { useBulkRemove } from '@/channels/hooks/useBulkRemove';
import { useMutation } from '@apollo/client';
import { REMOVE_CHANNEL } from '../graphql/mutations';

export const useChannelsRemove = () => {
  const [removeChannel] = useMutation(REMOVE_CHANNEL);
  const { bulkRemove, loading } = useBulkRemove(['GetChannels']);

  const removeChannels = (channelIds: string[]) =>
    bulkRemove(channelIds, (id) => removeChannel({ variables: { id } }));

  return { removeChannels, loading };
};
