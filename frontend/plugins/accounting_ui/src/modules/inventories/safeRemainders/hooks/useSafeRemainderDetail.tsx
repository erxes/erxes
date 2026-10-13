import type {
  AccountingSafeRemainderDetailQuery,
  AccountingSafeRemainderDetailQueryVariables,
} from '~/gql/graphql';
import type { QueryHookOptions } from '@apollo/client';
import { toGraphqlView } from '@/utils/graphql';
import { useQuery } from '@apollo/client';
import { SAFE_REMAINDER_DETAIL_QUERY } from '../graphql/safeRemainderQueries';

export const useSafeRemainderDetail = (
  options: QueryHookOptions<
    AccountingSafeRemainderDetailQuery,
    AccountingSafeRemainderDetailQueryVariables
  >,
) => {
  const {
    data: queryData,
    loading,
    error,
    refetch,
  } = useQuery(SAFE_REMAINDER_DETAIL_QUERY, {
    ...options,
  });
  const data = toGraphqlView(queryData);

  const safeRemainder = data?.safeRemainderDetail;

  return {
    safeRemainder,
    loading,
    error,
    refetch,
  };
};
