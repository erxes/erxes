import {
  ApolloCache,
  MutationHookOptions,
  OperationVariables,
  useMutation,
} from '@apollo/client';

import { useToast } from 'erxes-ui';
import { IPositionListItem, TPositionForm } from '../types/position';
import {
  ADD_POSITION,
  EDIT_POSITION,
  GET_POSITIONS_LIST,
  REMOVE_POSITIONS,
} from '../graphql';

interface PositionData {
  positionsMain: {
    list: IPositionListItem[];
    totalCount: number;
  };
}
interface AddPositionResult {
  positionsAdd: TPositionForm;
}

export function usePositionAdd(
  options?: MutationHookOptions<AddPositionResult, any>,
) {
  const { toast } = useToast();
  const [handleAdd, { loading, error }] = useMutation(ADD_POSITION, {
    ...options,
    update: (cache: ApolloCache<any>, { data }) => {
      try {
        const existingData = cache.readQuery<PositionData>({
          query: GET_POSITIONS_LIST,
        });
        if (!existingData || !existingData.positionsMain || !data?.positionsAdd)
          return;

        cache.writeQuery<PositionData>({
          query: GET_POSITIONS_LIST,
          data: {
            positionsMain: {
              ...existingData.positionsMain,
              list: [data.positionsAdd, ...existingData.positionsMain.list],
              totalCount: existingData.positionsMain.totalCount + 1,
            },
          },
        });
      } catch (e) {
        console.log('error', e);
      }
    },
    refetchQueries: ['Positions'],
  });

  return {
    handleAdd,
    loading,
    error,
  };
}

export function usePositionEdit(
  options?: MutationHookOptions<AddPositionResult, any>,
) {
  const { toast } = useToast();
  const [handleEdit, { loading, error }] = useMutation(EDIT_POSITION, {
    ...options,
    update: (cache: ApolloCache<any>, { data }) => {
      try {
        const existingData = cache.readQuery<PositionData>({
          query: GET_POSITIONS_LIST,
        });
        if (
          !existingData ||
          !existingData.positionsMain ||
          !data?.positionsEdit
        )
          return;

        cache.writeQuery<PositionData>({
          query: GET_POSITIONS_LIST,
          data: {
            positionsMain: {
              ...existingData.positionsMain,
              list: [data.positionsEdit, ...existingData.positionsMain.list],
              totalCount: existingData.positionsMain.totalCount + 1,
            },
          },
        });
      } catch (e) {
        console.log('error', e);
      }
    },
  });

  return {
    handleEdit,
    loading,
    error,
  };
}

export function useRemovePosition() {
  const { toast } = useToast();
  const [handleRemove, { loading, error }] = useMutation(REMOVE_POSITIONS, {
    onCompleted: () =>
      toast({ title: 'Removed successfully!', variant: 'success' }),
    refetchQueries: ['Positions'],
  });

  return {
    handleRemove,
    loading,
    error,
  };
}

export function usePositionInlineEdit() {
  const [_positionsEdit, { loading }] = useMutation(EDIT_POSITION);
  const { toast } = useToast();

  const positionsEdit = (
    operationVariables: OperationVariables,
    fields: string[],
  ) => {
    const variables = operationVariables?.variables || {};
    const fieldsToUpdate: Record<string, () => any> = {};
    fields.forEach((field) => {
      fieldsToUpdate[field] = () => variables[field];
    });
    return _positionsEdit({
      ...operationVariables,
      variables,
      update: (cache, { data: { positionsEdit } }) => {
        cache.modify({
          id: cache.identify(positionsEdit),
          fields: fieldsToUpdate,
        });
      },
      onCompleted: (data) => {
        if (data?.positionsEdit) {
          toast({
            title: `Position ${data.positionsEdit.code} updated successfully.`,
          });
        }
      },
    });
  };
  return { positionsEdit, loading };
}
