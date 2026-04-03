import { useMutation, MutationHookOptions } from '@apollo/client';
import { REMOVE_PROJECT_MUTATION } from '../graphql/mutation/removeProject';
import { useToast } from 'erxes-ui';

export const useRemoveProject = () => {
  const { toast } = useToast();
  const [removeProjectMutation, { loading, error }] = useMutation(
    REMOVE_PROJECT_MUTATION,
    {
      refetchQueries: ['projects', 'GetProjects'],
    },
  );

  const removeProject = (options: MutationHookOptions) => {
    return removeProjectMutation({
      ...options,
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Project removed successfully',
          variant: 'success',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return { removeProject, loading, error };
};
