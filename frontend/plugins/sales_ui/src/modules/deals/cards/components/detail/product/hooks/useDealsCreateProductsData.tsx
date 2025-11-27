import { useMutation, MutationHookOptions } from '@apollo/client';
import { DEALS_CREATE_PRODUCT_DATA } from '~/modules/deals/cards/components/detail/product/graphql/mutations/DealsCreateProductData';
import { useToast } from 'erxes-ui/hooks';

export const useDealsCreateProductsData = (options?: MutationHookOptions) => {
  const { toast } = useToast();
  const [createDealsProductData, { loading, error }] = useMutation(
    DEALS_CREATE_PRODUCT_DATA,
    {
      onCompleted: (data) => {
        toast({
          title: 'Success',
          variant: 'success',
        });
        options?.onCompleted && options?.onCompleted(data);
      },
      onError: (e) => {
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
        options?.onError && options?.onError(e);
      },
      ...options,
    },
  );
  return {
    createDealsProductData,
    loading,
    error,
  };
};
