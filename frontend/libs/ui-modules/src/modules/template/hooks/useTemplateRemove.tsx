import { useMutation, MutationHookOptions } from '@apollo/client';
import { toast } from 'erxes-ui';
import { REMOVE_TEMPLATE } from '../graphql/mutations';
export const useTemplateRemove = (options?: MutationHookOptions<any, any>) => {
  const [removeTemplate, { loading, error }] = useMutation(REMOVE_TEMPLATE, {
    ...options,
    refetchQueries: ['templateList'],
    awaitRefetchQueries: true,
    onCompleted: (...args) => {
      toast({
        title: 'Successfully removed template',
        variant: 'default',
      });
      options?.onCompleted?.(...args);
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: err.message || 'Failed to remove template',
        variant: 'destructive',
      });
    },
  });

  return {
    removeTemplate,
    loading,
    error,
  };
};
