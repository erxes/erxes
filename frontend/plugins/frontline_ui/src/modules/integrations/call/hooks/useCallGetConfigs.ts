import { useQuery } from '@apollo/client';
import { CALL_GET_CONFIGS } from '../graphql/queries/callConfigQueries';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

const CALL_CONFIGS_POLL_MS = 60 * 60 * 1000;

export const useCallGetConfigs = ({
  skip = false,
}: { skip?: boolean } = {}) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const { data, loading } = useQuery(CALL_GET_CONFIGS, {
    skip,
    // TURN credentials expire within a day; tabs and the desktop app stay
    // open overnight, so refresh them hourly.
    pollInterval: CALL_CONFIGS_POLL_MS,
    onError: (e) => {
      toast({
        title: t('something-went-wrong-getting-configs'),
        description: e.message,
        variant: 'destructive',
      });
    },
  });

  const callsGetConfigs = data?.callsGetConfigs;

  const callConfigs = useMemo(() => {
    const configs: Record<string, string> = {};
    (callsGetConfigs || []).forEach((conf) => {
      if (conf?.code && typeof conf.value === 'string') {
        configs[conf.code] = conf.value;
      }
    });
    return configs;
  }, [callsGetConfigs]);

  return { loading, callConfigs };
};
