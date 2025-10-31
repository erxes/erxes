import { MutationHookOptions, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { ADD_TAG } from '../graphql/mutations/tagsMutations';

export const useTagsAdd = () => {
  const [addTag, { loading, error }] = useMutation(ADD_TAG);

  const mutate = ({ variables, ...options }: MutationHookOptions) => {
    addTag({
      ...options,
      variables,
      refetchQueries: ['Tags'],
      onError(error) {
        toast({
          title: error?.message || 'Failed to add tag',
          variant: 'destructive',
        });
      },
    });
  };

  return {
    addTag: mutate,
    loading,
    error,
  };
};
