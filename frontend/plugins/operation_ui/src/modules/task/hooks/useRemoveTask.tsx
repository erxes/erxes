import { useMutation, MutationFunctionOptions } from '@apollo/client';
import { REMOVE_TASK_MUTATION } from '@/task/graphql/mutations/removeTask';
import { useToast } from 'erxes-ui';

export const useRemoveTask = () => {
  const { toast } = useToast();
  const [_removeTask, { loading, error }] = useMutation(REMOVE_TASK_MUTATION);
  const removeTask = (id: string, options?: MutationFunctionOptions) => {
    return _removeTask({
      ...options,
      variables: {
        id,
        ...options?.variables,
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

  return { removeTask, loading, error };
};
