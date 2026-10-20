import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { compactList } from '@/loyalties/utils/cursorList';
import { GET_BOARDS } from '@/pricing/graphql/queries';
import type { SalesBoardsQuery } from '~/gql/graphql';

export type IBoard = NonNullable<
  NonNullable<SalesBoardsQuery['salesBoards']>[number]
>;

export const useBoards = () => {
  const { data, loading, error } = useQuery(GET_BOARDS);
  const boards = useMemo(
    () => compactList(data?.salesBoards),
    [data?.salesBoards],
  );

  return { boards, loading, error };
};
