import { ApolloError, MutationHookOptions, useMutation } from '@apollo/client';

import { productRemove } from '@/deals/cards/components/detail/product/graphql/mutations/ProductsActions';
import { useToast } from 'erxes-ui';

export const useRemoveProducts = () => {
  const [_removeProducts, { loading }] = useMutation(productRemove);
  const { toast } = useToast();

  const removeProducts = (options?: MutationHookOptions) => {
    _removeProducts({
      ...options,
      variables: { ...options?.variables },
      onCompleted: (data) => {
        toast({
          title: 'Products deleted successfully',
          variant: 'success',
        });
        options?.onCompleted?.(data);
      },
      onError: (e: ApolloError) => {
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
        options?.onError?.(e);
      },
    });
  };

  return { removeProducts, loading };
};
