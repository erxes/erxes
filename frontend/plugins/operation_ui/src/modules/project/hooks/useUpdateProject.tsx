import { useMutation, MutationHookOptions } from '@apollo/client';
import { UPDATE_PROJECT_MUTATION } from '../graphql/mutation/updateProject';
import { useToast } from 'erxes-ui';
export const useUpdateProject = () => {
  const { toast } = useToast();
  const [_updateProject, { loading, error }] = useMutation(
    UPDATE_PROJECT_MUTATION,
  );
  const updateProject = (options: MutationHookOptions) => {
    return _updateProject({
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

  return { updateProject, loading, error };
};
