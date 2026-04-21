import { useToast } from 'erxes-ui';
import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { POS_COVER_EDIT_MUTATION } from '../graphql/mutation/posCoverEditMutation';

export const usePosCoversEdit = (
  options?: MutationFunctionOptions<{ posCoversEdit: { _id: string } }>,
) => {
  const { toast } = useToast();
  const [posCoversEdit, { loading, error }] = useMutation(
    POS_COVER_EDIT_MUTATION,
    {
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
      ...options,
    },
  );
  return { posCoversEdit, loading, error };
};
