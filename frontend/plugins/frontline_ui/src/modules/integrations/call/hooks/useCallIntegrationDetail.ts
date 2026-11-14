import { useQuery } from '@apollo/client';
import { CALL_INTEGRATION_DETAIL } from '../graphql/queries/callConfigQueries';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useCallIntegrationDetail = (integrationId: string) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });

  const { data, loading } = useQuery(CALL_INTEGRATION_DETAIL, {
    variables: integrationId ? { integrationId } : undefined,
    skip: !integrationId,
    onError: (e) => {
      toast({
        title: t('something-went-wrong-getting-integration-detail'),
        description: e.message,
        variant: 'destructive',
      });
    },
  });

  const { callsIntegrationDetail } = data || {};

  return { callsIntegrationDetail, loading };
};
