import {
  MutationFunctionOptions,
  MutationHookOptions,
  useMutation,
} from '@apollo/client';
import { BUNDLE_RULES_REMOVE } from '../graphql/mutations/bundleRules';
import { BUNDLE_RULES } from '../graphql/queries/getBundleRules';
import { useToast } from 'erxes-ui';

export const useBundleRulesRemove = (options?: MutationHookOptions) => {
  const { toast } = useToast();
  const [_remove, { loading, error }] = useMutation(
    BUNDLE_RULES_REMOVE,
    options,
  );

  const removeBundleRules = (options?: MutationFunctionOptions) => {
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
          description: 'Bundle rule removed successfully',
          variant: 'default',
        });
        options?.onCompleted?.();
      },
      refetchQueries: [{ query: BUNDLE_RULES }],
    });
  };

  return {
    removeBundleRules,
    loading,
    error,
  };
};
