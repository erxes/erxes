import {
  ADD_BOARD,
  EDIT_BOARD,
  REMOVE_BOARD,
} from '@/deals/graphql/mutations/BoardMutations';
import {
  GET_BOARDS,
  GET_BOARD_DETAIL,
} from '@/deals/graphql/queries/BoardsQueries';
import { TBoardForm } from '@/deals/types/boards';
import {
  MutationHookOptions,
  QueryHookOptions,
  useMutation,
  useQuery,
} from '@apollo/client';
import { isDefined, toast, useQueryState } from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  SalesBoardsAddMutation,
  SalesBoardsAddMutationVariables,
  SalesBoardsEditMutation,
  SalesBoardsEditMutationVariables,
  SalesBoardsQuery,
  SalesBoardsQueryVariables,
  SalesBoardsRemoveMutation,
  SalesBoardsRemoveMutationVariables,
  SalesDealBoardDetailQuery,
  SalesDealBoardDetailQueryVariables,
} from '~/gql/graphql';

import { BOARD_CREATE_SCHEMA } from '@/deals/schemas/boardFormSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

export const useBoards = (
  options?: QueryHookOptions<SalesBoardsQuery, SalesBoardsQueryVariables>,
) => {
  const { data, loading, error } = useQuery(GET_BOARDS, {
    ...options,
    variables: options?.variables,
  });

  const boards = useMemo(
    () =>
      data?.salesBoards
        ?.filter(isDefined)
        .sort(
          (a, b) =>
            Number(a.status === 'archived') - Number(b.status === 'archived'),
        ),
    [data?.salesBoards],
  );

  return { boards, loading, error };
};

export const useBoardDetail = (
  options?: QueryHookOptions<
    SalesDealBoardDetailQuery,
    SalesDealBoardDetailQueryVariables
  >,
) => {
  const [stateBoardId] = useQueryState<string>('boardId');
  const idToUse = options?.variables?._id || stateBoardId;

  const { data, loading, error } = useQuery(GET_BOARD_DETAIL, {
    ...options,
    variables: idToUse ? { _id: idToUse } : undefined,
    skip: !idToUse,
  });

  return { boardDetail: data?.salesBoardDetail, loading, error };
};

export const useAddBoardForm = () => {
  const form = useForm<TBoardForm>({
    mode: 'onBlur',
    resolver: zodResolver(BOARD_CREATE_SCHEMA),
  });
  return {
    methods: form,
  };
};

export const useBoardAdd = (
  options?: MutationHookOptions<
    SalesBoardsAddMutation,
    SalesBoardsAddMutationVariables
  >,
) => {
  const [addBoard, { loading, error }] = useMutation(ADD_BOARD, {
    ...options,
    variables: options?.variables,
    refetchQueries: [GET_BOARDS],
    awaitRefetchQueries: true,
  });

  return {
    addBoard,
    loading,
    error,
  };
};

export const useBoardEdit = (
  options?: MutationHookOptions<
    SalesBoardsEditMutation,
    SalesBoardsEditMutationVariables
  >,
) => {
  const [editBoard, { loading, error }] = useMutation(EDIT_BOARD, {
    ...options,
    variables: options?.variables,
    refetchQueries: [GET_BOARDS],
    awaitRefetchQueries: true,
  });

  return {
    editBoard,
    loading,
    error,
  };
};

export const useBoardRemove = (
  options?: MutationHookOptions<
    SalesBoardsRemoveMutation,
    SalesBoardsRemoveMutationVariables
  >,
) => {
  const { t } = useTranslation('sales');
  const [removeBoard, { loading, error }] = useMutation(REMOVE_BOARD, {
    ...options,
    variables: options?.variables,
    refetchQueries: [GET_BOARDS],
    awaitRefetchQueries: true,
    onCompleted: (...args) => {
      toast({
        title: t('board-removed'),
        variant: 'default',
      });
      options?.onCompleted?.(...args);
    },
    onError: (err) => {
      toast({
        title: t('error'),
        description: err.message || t('remove-failed'),
        variant: 'destructive',
      });
    },
  });

  return {
    removeBoard,
    loading,
    error,
  };
};
