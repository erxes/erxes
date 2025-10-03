import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { REMOVE_CHANNELS } from '../graphql/mutations/removeChannels';
import { GET_CHANNELS } from '../graphql';

export function useChannelRemove() {
  const { toast } = useToast();
  const [channelsRemove, { loading, error }] = useMutation(REMOVE_CHANNELS, {
    onCompleted: () => toast({ title: 'Removed successfully!' }),
    refetchQueries: [GET_CHANNELS],
  });

  return {
    channelsRemove,
    loading,
    error,
  };
}
