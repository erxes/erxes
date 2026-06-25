import { useMutation } from '@apollo/client';
import { ADD_INTEGRATION } from '../graphql/mutations/AddIntegration';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useIntegrationAdd = () => {
  const { t } = useTranslation('frontline');
  const [addIntegration, { loading }] = useMutation(ADD_INTEGRATION, {
    refetchQueries: ['Integrations', 'IntegrationDetail'],
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
