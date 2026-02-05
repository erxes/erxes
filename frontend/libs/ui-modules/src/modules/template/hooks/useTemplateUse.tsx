import { useMutation, MutationHookOptions } from '@apollo/client';
import { toast } from 'erxes-ui';
import { USE_TEMPLATE } from '../graphql/mutations';
export const useTemplateUse = (options?: MutationHookOptions<any, any>) => {
  const [useTemplate, { loading, error }] = useMutation(USE_TEMPLATE, {
    ...options,
    onCompleted: (...args) => {
      toast({
        title: 'Template used successfully',
        variant: 'default',
      });
      options?.onCompleted?.(...args);
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: err.message || 'Failed to use template',
        variant: 'destructive',
      });
    },
  });

  return {
    useTemplate,
    loading,
    error,
  };
};
