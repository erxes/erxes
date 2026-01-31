import { GET_BOARDS, GET_BOARD_DETAIL } from '../graphql/queries/BoardQueries';
import { IBoard } from '../types/boards';
import { QueryHookOptions, useQuery } from '@apollo/client';
import { useQueryState } from 'erxes-ui';

export const useBoards = (
  options?: QueryHookOptions<{ salesBoards: IBoard[] }>,
) => {
  const { data, loading, error } = useQuery<{ salesBoards: IBoard[] }>(
    GET_BOARDS,
    {
      ...options,
      variables: {
        ...options?.variables,
      },
    },
  );

  return { boards: data?.salesBoards, loading, error };
};

export const useBoardDetail = (
  options?: QueryHookOptions<{ salesBoardDetail: IBoard }>,
) => {
  const [stateBoardId] = useQueryState('boardId');
  const idToUse = options?.variables?._id || stateBoardId;

  const { data, loading, error } = useQuery<{ salesBoardDetail: IBoard }>(
    GET_BOARD_DETAIL,
    {
      ...options,
      variables: {
        ...options?.variables,
        _id: idToUse,
      },
      skip: !idToUse,
    },
  );

  return { boardDetail: data?.salesBoardDetail, loading, error };
};
