import { MutationHookOptions, useMutation } from '@apollo/client';
import { ADD_TAG } from '../graphql/mutations/tagsMutations';

export const useTagsAdd = () => {
  const [addTag, { loading, error }] = useMutation(ADD_TAG);

  const mutate = ({ variables, ...options }: MutationHookOptions) => {
    addTag({
      ...options,
      variables,
      refetchQueries: ['Tags'],
      onError(error) {
        console.error(error);
      },
    });
  };

  return {
    addTag: mutate,
    loading,
    error,
  };
};
