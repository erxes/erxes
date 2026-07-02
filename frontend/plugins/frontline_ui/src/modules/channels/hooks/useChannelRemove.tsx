import { useMutation } from '@apollo/client';
import { REMOVE_CHANNEL } from '../graphql/mutations';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useChannelRemove = () => {
  const { t } = useTranslation('frontline');
  const [removeChannel, { loading, error }] = useMutation(REMOVE_CHANNEL, {
    onCompleted: (data) => {
      toast({ title: t('channel-removed') });
    },
    refetchQueries: ['GetChannels'],
  });
  return { removeChannel, loading, error };
};
