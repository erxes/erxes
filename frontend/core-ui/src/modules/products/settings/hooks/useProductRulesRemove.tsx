import { useTranslation } from 'react-i18next';
import {
  MutationFunctionOptions,
  MutationHookOptions,
  useMutation,
} from '@apollo/client';
import { PRODUCT_RULES_REMOVE } from '../graphql/mutations/productRules';
import { useToast } from 'erxes-ui';

export const useProductRulesRemove = (options?: MutationHookOptions) => {
  const { toast } = useToast();
  const { t } = useTranslation('product', { keyPrefix: 'product-rules' });
  const [_remove, { loading, error }] = useMutation(
    PRODUCT_RULES_REMOVE,
    options,
  );

  const removeProductRules = (options?: MutationFunctionOptions) => {
    _remove({
      ...options,
      onError: (e) => {
        toast({
          title: t('error'),
          description: e?.message,
          variant: 'destructive',
        });
        options?.onError?.(e);
      },
      onCompleted: (data) => {
        toast({
          title: t('success'),
          description: t('rule-removed'),
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
