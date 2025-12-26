import { useMutation } from '@apollo/client';
import { REMOVE_TAG } from '../graphql/tagMutations';
import { useToast } from 'erxes-ui';

export const useTagRemove = () => {
  const { toast } = useToast();
  const [_removeTag, { loading, error }] = useMutation(REMOVE_TAG);
  const removeTag = (id: string) => {
    _removeTag({
      variables: { id },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message,
        });
      },
      // To do: handle cache instead of refetchQueries
      refetchQueries: ['TagsMain'],
    });
  };
  return { removeTag, loading, error };
};
