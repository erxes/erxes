import { useMutation } from '@apollo/client';
import { REMOVE_TAG } from '../graphql/mutations/tagsMutations';
import { useToast } from 'erxes-ui';

export function useRemoveTag() {
  const { toast } = useToast();
  const [removeTagMutation, { loading, error }] = useMutation(REMOVE_TAG);

  const removeTag = async (tagId: string): Promise<boolean> => {
    try {
      await removeTagMutation({
        variables: { _id: tagId },
        onCompleted: () => toast({ title: 'Tag has been removed' }),
        onError: () =>
          toast({ title: 'Failed to remove tag', variant: 'destructive' }),
        refetchQueries: ['Tags'],
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
}
