import { ADD_BOARD, EDIT_BOARD, REMOVE_BOARD } from "@/deals/graphql/mutations/BoardMutations";
import { GET_BOARDS, GET_BOARD_DETAIL } from "@/deals/graphql/queries/BoardsQueries";
import { IBoard, TBoardForm } from "@/deals/types/boards";
import { MutationHookOptions, QueryHookOptions, useMutation, useQuery } from "@apollo/client";
import { toast, useQueryState } from "erxes-ui";

import { BOARD_CREATE_SCHEMA } from "@/deals/schemas/boardFormSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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

  export const useAddBoardForm = () => {
    const form = useForm<TBoardForm>({
      mode: 'onBlur',
      resolver: zodResolver(BOARD_CREATE_SCHEMA),
    });
    return {
      methods: form,
    };
  };

  export const useBoardAdd = (options?: MutationHookOptions<{ salesBoards: IBoard[] }>) => {
    
    const [addBoard, { loading, error }] = useMutation(ADD_BOARD, {
      ...options,
       variables: {
            ...options?.variables,
          },
          refetchQueries: [
            {
              query: GET_BOARDS,
              variables: {
                ...options?.variables,
              },
            },
          ],
          awaitRefetchQueries: true,
    });

    return {
      addBoard,
      loading,
      error,
    };
  };

  export const useBoardEdit = (options?: MutationHookOptions<{ salesBoards: IBoard[] }>) => {
    const [boardId] = useQueryState('boardId');
    
    const [editBoard, { loading, error }] = useMutation(EDIT_BOARD, {
      ...options,
       variables: {
            ...options?.variables,
            _id: boardId,
          },
          refetchQueries: [
            {
              query: GET_BOARDS,
              variables: {
                ...options?.variables,
              },
            },
          ],
          awaitRefetchQueries: true,
    });

    return {
      editBoard,
      loading,
      error,
    };
  };

  export const useBoardRemove = (options?: MutationHookOptions<{ salesBoards: IBoard[] }>) => {    
    const [removeBoard, { loading, error }] = useMutation(REMOVE_BOARD, {
      ...options,
       variables: {
          ...options?.variables,
        },
        refetchQueries: [
          {
            query: GET_BOARDS,
            variables: {
              ...options?.variables,
            },
          },
        ],
        awaitRefetchQueries: true,
        onCompleted: (...args) => {
          toast({
            title: 'Successfully removed a board',
            variant: 'default',
          });
          options?.onCompleted?.(...args);
        },
        onError: (err) => {
          toast({
            title: 'Error',
            description: err.message || 'Remove failed',
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