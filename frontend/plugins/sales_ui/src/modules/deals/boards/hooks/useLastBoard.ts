import { QueryHookOptions, useQuery } from '@apollo/client';
import type {
  SalesBoardGetLastQuery,
  SalesBoardGetLastQueryVariables,
} from '~/gql/graphql';

import { GET_BOARD_GET_LAST } from '@/deals/graphql/queries/BoardsQueries';

export const useLastBoard = (
  options?: QueryHookOptions<
    SalesBoardGetLastQuery,
    SalesBoardGetLastQueryVariables
  >,
) => {
  const { data, loading, error } = useQuery(GET_BOARD_GET_LAST, {
    ...options,
    variables: {
      ...options?.variables,
    },
  });

  return { lastBoard: data?.salesBoardGetLast, loading, error };
};
