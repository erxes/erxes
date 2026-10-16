import type {
  AccountingCtaxRowDetailQuery,
  AccountingCtaxRowDetailQueryVariables,
} from '~/gql/graphql';
import type { QueryHookOptions } from '@apollo/client';
import { toGraphqlView } from '@/utils/graphql';
import { useQuery } from '@apollo/client';
import { GET_CTAX_VALUE } from '../graphql/queries/getCtaxs';

export const useCtaxValue = (
  options?: QueryHookOptions<
    AccountingCtaxRowDetailQuery,
    AccountingCtaxRowDetailQueryVariables
  >,
) => {
  const { data: queryData, loading } = useQuery(GET_CTAX_VALUE, {
    ...options,
  });
  const data = toGraphqlView(queryData);

  return {
    ctaxRowDetail: data?.ctaxRowDetail,
    loading,
  };
};
