import {
  MutationFunctionOptions,
  MutationHookOptions,
  useMutation,
} from '@apollo/client';
import { PRODUCT_RULES_REMOVE } from '../graphql/mutations/productRules';
import { useToast } from 'erxes-ui';

export const useProductRulesRemove = (options?: MutationHookOptions) => {
  const { toast } = useToast();
  const [_remove, { loading, error }] = useMutation(
    PRODUCT_RULES_REMOVE,
    options,
  );

  const removeProductRules = (options?: MutationFunctionOptions) => {
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
      onCompleted: (data) => {
        toast({
          title: 'Success',
          description: 'Product rule removed successfully',
          variant: 'default',
        });
        options?.onCompleted?.(data);
      },
      refetchQueries: ['productRules'],
    });
  };

  return {
    removeProductRules,
    loading,
    error,
  };
};
