import { QueryHookOptions, useQuery } from '@apollo/client';
import { CALL_PRO_CONFIG } from '@/integrations/callpro/graphql/queries/callProQueries';
import type {
  CallProConfigQuery,
  CallProConfigQueryVariables,
} from '~/gql/graphql';

export const useCallProConfig = (
  options?: QueryHookOptions<CallProConfigQuery, CallProConfigQueryVariables>,
) => {
  const { data, loading, error } = useQuery(CALL_PRO_CONFIG, options);

  const callProConfig = data?.callProConfig ?? undefined;

  return {
    callProConfig,
    enabled: !!callProConfig?.enabled,
    webhookUrl: callProConfig?.webhookUrl,
    loading,
    error,
  };
};
