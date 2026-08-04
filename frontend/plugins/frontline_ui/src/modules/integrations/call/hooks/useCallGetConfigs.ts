import { useQuery } from '@apollo/client';
import { CALL_GET_CONFIGS } from '../graphql/queries/callConfigQueries';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useCallGetConfigs = () => {
  const { t } = useTranslation('frontline');
  const { data, loading } = useQuery<{
    callsGetConfigs: { _id: string; code: string; value: string }[];
  }>(CALL_GET_CONFIGS, {
    onError: (e) => {
      toast({
        title: t('something-went-wrong-getting-configs'),
        description: e.message,
        variant: 'destructive',
      });
    },
  });

  const { callsGetConfigs } = data || {};

  const callConfigs: Record<string, string> = {};

  (callsGetConfigs || []).forEach(
    (conf) => (callConfigs[conf.code] = conf.value),
  );

  return { loading, callConfigs };
};
