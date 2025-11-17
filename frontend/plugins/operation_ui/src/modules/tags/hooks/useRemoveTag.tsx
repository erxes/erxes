import { MutationHookOptions, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { toast } from 'erxes-ui';

const REMOVE_TAG = gql`
  mutation removeTag($_id: String!) {
    tagsRemove(_id: $_id)
  }
`;

export const useRemoveTag = () => {
  const [remove, { loading, error }] = useMutation(REMOVE_TAG);

  const removeTag = async (_id: string, options?: MutationHookOptions): Promise<boolean> => {
    try {
      await remove({
        ...options,
        variables: { _id },
        refetchQueries: ['Tags'],
        onCompleted: () => {
          toast({ title: 'Tag has been removed' });
        },
        onError: (error) => {
          toast({
            title: error?.message || 'Failed to remove tag',
            variant: 'destructive',
          });
        },
      });
      return true;
    } catch (err) {
      console.error('Error removing tag:', err);
      return false;
    }
  };

  return {
    removeTag,
    loading,
    error,
  };
};
