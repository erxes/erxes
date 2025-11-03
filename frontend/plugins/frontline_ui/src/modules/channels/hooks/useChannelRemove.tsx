import { useMutation } from '@apollo/client';
import { REMOVE_CHANNEL } from '../graphql/mutations';
import { toast } from 'erxes-ui';

export const useChannelRemove = () => {
  const [removeChannel, { loading, error }] = useMutation(REMOVE_CHANNEL, {
    onCompleted: (data) => {
      toast({ title: 'Channel removed successfully' });
    },
    refetchQueries: ['GetChannels'],
  });
  return { removeChannel, loading, error };
};
