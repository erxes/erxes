import {
  MutationFunctionOptions,
  MutationHookOptions,
  useMutation,
} from '@apollo/client';
import { BUNDLE_CONDITION_DEFAULT } from '../graphql/mutations/bundleConditions';
import { useToast } from 'erxes-ui';

export const useBundleConditionDefault = (options?: MutationHookOptions) => {
  const { toast } = useToast();
  const [_default, { loading, error }] = useMutation(
    BUNDLE_CONDITION_DEFAULT,
    options,
  );

  const bundleConditionDefault = (options?: MutationFunctionOptions) => {
    _default({
      ...options,
      onError: (e) => {
        toast({
          title: 'Error',
          description: e?.message,
          variant: 'destructive',
        });
        options?.onError?.(e);
      },
      onCompleted: (data) => {
        toast({
          title: 'Success',
          description: 'Bundle condition set as default successfully',
          variant: 'default',
        });
        options?.onCompleted?.(data);
      },
      refetchQueries: ['BundleConditions'],
    });
  };

  return {
    bundleConditionDefault,
    loading,
    error,
  };
};
