import { QueryHookOptions, useQuery } from "@apollo/client";

import { GET_BOARD_DETAIL } from "@/deals/graphql/queries/BoardsQueries";
import { IBoard } from "@/deals/types/boards";

export const useBoardDetail = (
  options?: QueryHookOptions<{ salesBoardDetail: IBoard }>,
) => {          
  const { data, loading, error } = useQuery<{ salesBoardDetail: IBoard }>(
    GET_BOARD_DETAIL,
    {
      ...options,
      variables: {
        ...options?.variables,
      },
    },
  );

  return { boardDetail: data?.salesBoardDetail, loading, error };
};