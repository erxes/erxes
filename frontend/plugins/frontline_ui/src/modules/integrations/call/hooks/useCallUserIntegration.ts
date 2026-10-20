import { CALL_USER_INTEGRATIONS } from '@/integrations/call/graphql/queries/callConfigQueries';
import { useQuery } from '@apollo/client';
import { isDefined, toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useCallUserIntegration = () => {
  const { t } = useTranslation('frontline');
  const { data, loading } = useQuery(CALL_USER_INTEGRATIONS, {
    onError: (e) => {
      toast({
        title: t('something-went-wrong-getting-user-integrations'),
        description: e.message,
        variant: 'destructive',
      });
    },
  });

  const callUserIntegrations = data?.callUserIntegrations?.filter(isDefined);

  return { callUserIntegrations, loading };
};
