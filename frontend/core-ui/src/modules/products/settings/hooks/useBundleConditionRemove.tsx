import {
  MutationFunctionOptions,
  MutationHookOptions,
  useMutation,
} from '@apollo/client';
import { BUNDLE_CONDITION_REMOVE } from '../graphql/mutations/bundleConditions';
import { useToast } from 'erxes-ui';

export const useBundleConditionRemove = (options?: MutationHookOptions) => {
  const { toast } = useToast();
  const [_remove, { loading, error }] = useMutation(
    BUNDLE_CONDITION_REMOVE,
    options,
  );

  const removeBundleConditions = (options?: MutationFunctionOptions) => {
    _remove({
      ...options,
      onError: (e) => {
        toast({
          title: 'Error',
          description: e?.message,
          variant: 'destructive',
        });
        options?.onError?.(e);
      },
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Bundle condition removed successfully',
          variant: 'default',
        });
        options?.onCompleted?.();
      },
      refetchQueries: ['BundleConditions'],
    });
  };

  return {
    removeBundleConditions,
    loading,
    error,
  };
};
