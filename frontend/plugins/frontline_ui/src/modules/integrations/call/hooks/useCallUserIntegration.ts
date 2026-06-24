import { CALL_USER_INTEGRATIONS } from '@/integrations/call/graphql/queries/callConfigQueries';
import { ICallConfig } from '@/integrations/call/types/callTypes';
import { useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useCallUserIntegration = () => {
  const { t } = useTranslation('frontline');
  const { data, loading } = useQuery<{
    callUserIntegrations: ICallConfig[];
  }>(CALL_USER_INTEGRATIONS, {
    onError: (e) => {
      toast({
        title: t('something-went-wrong-getting-user-integrations'),
        description: e.message,
        variant: 'destructive',
      });
    },
  });

  const { callUserIntegrations } = data || {};

  return { callUserIntegrations, loading };
};
