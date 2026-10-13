import type {
  AccountingsConfigsQuery,
  AccountingsConfigsQueryVariables,
} from '~/gql/graphql';
import { toGraphqlView } from '@/utils/graphql';
import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_ACCOUNTING_CONFIGS } from '../graphql/queries/mainConfigs';

export const useAccountingConfigs = (
  options?: QueryHookOptions<
    AccountingsConfigsQuery,
    AccountingsConfigsQueryVariables
  >,
) => {
  const {
    data: queryData,
    loading,
    error,
  } = useQuery(GET_ACCOUNTING_CONFIGS, {
    variables: {
      ...options?.variables,
      code: options?.variables?.code ?? '',
    },
    skip: !options?.variables?.code,
  });
  const data = toGraphqlView(queryData);

  const { accountingsConfigs } = data || {};

  return {
    configs: accountingsConfigs,
    loading,
    error,
  };
};
