import { useMutation, gql, MutationFunctionOptions } from '@apollo/client';
import { toast } from 'erxes-ui';

const REMOVE_TAG = gql`
  mutation removeTag($_id: String!) {
    tagsRemove(_id: $_id)
  }
`;

export const useRemoveTag = () => {
  const [remove, { loading, error }] = useMutation(REMOVE_TAG);

  const removeTag = (
    _id: string,
    options?: MutationFunctionOptions,
  ): Promise<boolean> => {
    const { onCompleted, onError, ...restOptions } = options ?? {};

    return remove({
      ...restOptions,
      variables: { _id },
      refetchQueries: ['Tags'],
      onCompleted: (data, clientOptions) => {
        onCompleted?.(data, clientOptions);
        toast({ title: 'Tag has been removed' });
      },
      onError: (apolloError) => {
        onError?.(apolloError);
        toast({
          title: apolloError?.message ?? 'Failed to remove tag',
          variant: 'destructive',
        });
      },
    })
      .then(() => true)
      .catch(() => false);
  };

  return {
    removeTag,
    loading,
    error,
  };
};
