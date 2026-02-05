import { useMutation, MutationHookOptions } from '@apollo/client';
import { toast } from 'erxes-ui';
import { ADD_TEMPLATE } from '../graphql/mutations';
export const useTemplateAdd = (options?: MutationHookOptions<any, any>) => {
  const [addTemplate, { loading, error }] = useMutation(ADD_TEMPLATE, {
    ...options,
    refetchQueries: ['templateList'],
    awaitRefetchQueries: true,
    onCompleted: (...args) => {
      toast({
        title: 'Successfully added template',
        variant: 'default',
      });
      options?.onCompleted?.(...args);
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: err.message || 'Failed to add template',
        variant: 'destructive',
      });
    },
  });

  return {
    addTemplate,
    loading,
    error,
  };
};
