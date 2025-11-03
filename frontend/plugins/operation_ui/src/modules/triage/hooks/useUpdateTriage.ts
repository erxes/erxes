import { useMutation, MutationHookOptions } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { UPDATE_TRIAGE_MUTATION } from '../graphql/mutations/updateTriage';

export const useUpdateTriage = () => {
  const { toast } = useToast();
  const [updateTriageMutation, { loading, error }] = useMutation(
    UPDATE_TRIAGE_MUTATION,
  );
  const updateTriage = (options: MutationHookOptions) => {
    return updateTriageMutation({
      ...options,
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };
  return { updateTriage, loading, error };
};
