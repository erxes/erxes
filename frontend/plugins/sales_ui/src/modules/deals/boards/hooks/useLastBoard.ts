import { QueryHookOptions, useQuery } from "@apollo/client";

import { GET_BOARD_GET_LAST } from "@/deals/graphql/queries/BoardsQueries";
import { IBoard } from "@/deals/types/boards";

export const useLastBoard = (
    options?: QueryHookOptions<{ salesBoardGetLast: IBoard }>,
  ) => {  
    const { data, loading, error } = useQuery<{ salesBoardGetLast: IBoard }>(
      GET_BOARD_GET_LAST,
      {
        ...options,
        variables: {
          ...options?.variables,
        },
      },
    );
  
    return { lastBoard: data?.salesBoardGetLast, loading, error };
  };