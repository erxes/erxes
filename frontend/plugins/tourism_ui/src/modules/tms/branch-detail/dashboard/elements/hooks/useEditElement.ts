import { useMutation } from '@apollo/client';
import { EDIT_ELEMENT } from '../graphql/mutation';
import type {
  BmsElementEditMutation,
  BmsElementEditMutationVariables,
} from '~/gql/graphql';

export const useEditElement = () => {
  const [editElementMutation, { loading, error }] = useMutation(EDIT_ELEMENT, {
    refetchQueries: ['BmsElements'],
    awaitRefetchQueries: true,
  });

  const editElement = (options: {
    variables: BmsElementEditMutationVariables;
    onCompleted?: (data: BmsElementEditMutation) => void;
    onError?: (error: unknown) => void;
  }) => {
    return editElementMutation(options);
  };

  return {
    editElement,
    loading,
    error,
  };
};
