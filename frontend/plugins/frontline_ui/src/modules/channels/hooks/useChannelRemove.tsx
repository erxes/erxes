import { CHANNEL_REFETCH_QUERIES } from '@/channels/constants/refetchQueries';
import { useMutation } from '@apollo/client';
import { REMOVE_CHANNEL } from '../graphql/mutations';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useChannelRemove = () => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });
  const [removeChannel, { loading, error }] = useMutation(REMOVE_CHANNEL, {
    onCompleted: (data) => {
      toast({ title: t('channel-removed', 'Channel removed successfully') });
    },
    refetchQueries: CHANNEL_REFETCH_QUERIES,
    onError: (error) =>
      toast({
        title: t('error', 'Error'),
        description: error.message,
        variant: 'destructive',
      }),
  });
  return { removeChannel, loading, error };
};
