import { QueryHookOptions, useQuery } from '@apollo/client';
import { CALL_PRO_CONFIG } from '@/integrations/callpro/graphql/queries/callProQueries';
import { ICallProConfig } from '@/integrations/callpro/types/callProTypes';

export const useCallProConfig = (
  options?: QueryHookOptions<{ callProConfig: ICallProConfig | null }>,
) => {
  const { data, loading, error } = useQuery(CALL_PRO_CONFIG, options);

  const { callProConfig } = data || {};

  return {
    callProConfig,
    enabled: !!callProConfig?.enabled,
    webhookUrl: callProConfig?.webhookUrl,
    loading,
    error,
  };
};
