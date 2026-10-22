import { POS_LIST } from '@/pos/graphql/queries/getPos';
import { QueryHookOptions, useQuery } from '@apollo/client';
import type {
  SalesPosNavigationListQuery,
  SalesPosNavigationListQueryVariables,
} from '~/gql/graphql';
import { hasId } from '../utils/posJson';

export const useGetCurrentUsersPos = (
  options?: QueryHookOptions<
    SalesPosNavigationListQuery,
    SalesPosNavigationListQueryVariables
  >,
) => {
  const { data, loading } = useQuery(POS_LIST, {
    ...options,
    variables: {
      ...options?.variables,
    },
  });

  const pos = data?.posList?.filter(hasId);

  return { pos, loading };
};
