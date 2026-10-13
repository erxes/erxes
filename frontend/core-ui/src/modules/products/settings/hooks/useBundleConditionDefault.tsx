import { useTranslation } from 'react-i18next';
import {
  MutationFunctionOptions,
  MutationHookOptions,
  useMutation,
} from '@apollo/client';
import { BUNDLE_CONDITION_DEFAULT } from '../graphql/mutations/bundleConditions';
import { useToast } from 'erxes-ui';

export const useBundleConditionDefault = (options?: MutationHookOptions) => {
  const { toast } = useToast();
  const { t } = useTranslation('product', { keyPrefix: 'bundle-conditions' });
  const [_default, { loading, error }] = useMutation(
    BUNDLE_CONDITION_DEFAULT,
    options,
  );

  const bundleConditionDefault = (options?: MutationFunctionOptions) => {
    _default({
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
          description: t('condition-default-set'),
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
