import { useMutation } from '@apollo/client';
import { ADD_INTEGRATION } from '../graphql/mutations/AddIntegration';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useIntegrationAdd = () => {
  const { t } = useTranslation('frontline');
  const [addIntegration, { loading }] = useMutation(ADD_INTEGRATION, {
    // 'DiscordConnectedServers' / 'DiscordTakenChannels' back the Discord
    // wizard's connected-server picker and taken-channel filter: refetching them
    // means a channel added this session drops out of the picker (and a
    // newly-connected server appears) without a reload. No-op for non-Discord
    // flows where those queries aren't active.
    refetchQueries: [
      'Integrations',
      'IntegrationDetail',
      'DiscordConnectedServers',
      'DiscordTakenChannels',
    ],
    onCompleted() {
      toast({
        title: t('integration-added'),
        variant: 'default',
      });
    },
    onError(e) {
      toast({
        title: t('failed-to-add-integration'),
        description: e?.message,
        variant: 'destructive',
      });
    },
  });

  return {
    addIntegration,
    loading,
  };
};
