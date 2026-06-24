import { ApolloError, MutationHookOptions, useMutation } from '@apollo/client';

import { productRemove } from '@/deals/cards/components/detail/product/graphql/mutations/ProductsActions';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useRemoveProducts = () => {
  const [_removeProducts, { loading }] = useMutation(productRemove);
  const { toast } = useToast();
  const { t } = useTranslation('sales');

  const removeProducts = (options?: MutationHookOptions) => {
    _removeProducts({
      ...options,
      variables: { ...options?.variables },
      onCompleted: (data) => {
        toast({
          title: t('products-deleted'),
          variant: 'success',
        });
        options?.onCompleted?.(data);
      },
      onError: (e: ApolloError) => {
        toast({
          title: t('error'),
          description: e.message,
          variant: 'destructive',
        });
        options?.onError?.(e);
      },
    });
  };

  return { removeProducts, loading };
};
