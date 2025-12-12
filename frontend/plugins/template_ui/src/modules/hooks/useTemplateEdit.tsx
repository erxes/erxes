import { useMutation, MutationHookOptions } from '@apollo/client';
import { toast } from 'erxes-ui';
import { EDIT_TEMPLATE } from '../graphql/mutations';
export const useTemplateEdit = (options?: MutationHookOptions<any, any>) => {
  const [editTemplate, { loading, error }] = useMutation(EDIT_TEMPLATE, {
    ...options,
    refetchQueries: ['templateList', 'templateDetail'],
    awaitRefetchQueries: true,
    onCompleted: (...args) => {
      toast({
        title: 'Successfully updated template',
        variant: 'default',
      });
      options?.onCompleted?.(...args);
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update template',
        variant: 'destructive',
      });
    },
  });

  return {
    editTemplate,
    loading,
    error,
  };
};
