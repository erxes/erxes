import { useMutation } from '@apollo/client';
import { CREATE_ELEMENT } from '../graphql/mutation';
import type {
  BmsElementAddMutation,
  BmsElementAddMutationVariables,
  BmsElementTranslationInput,
} from '~/gql/graphql';

export type IElementTranslationInput = BmsElementTranslationInput;

export const useCreateElement = () => {
  const [createElementMutation, { loading, error }] = useMutation(
    CREATE_ELEMENT,
    {
      refetchQueries: ['BmsElements'],
      awaitRefetchQueries: true,
    },
  );

  const createElement = (options: {
    variables: BmsElementAddMutationVariables;
    onCompleted?: (data: BmsElementAddMutation) => void;
    onError?: (error: unknown) => void;
  }) => {
    return createElementMutation(options);
  };

  return {
    createElement,
    loading,
    error,
  };
};
