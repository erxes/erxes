import { useTranslation } from 'react-i18next';
import {
  MutationFunctionOptions,
  MutationHookOptions,
  useMutation,
} from '@apollo/client';
import { UOMS_REMOVE } from '../graphql/mutations/cudUoms';
import { useToast } from 'erxes-ui';
export const useUomsRemove = (options?: MutationHookOptions) => {
  const { toast } = useToast();
  const { t } = useTranslation('product', { keyPrefix: 'uoms' });
  const [_removeUoms, { loading, error }] = useMutation(UOMS_REMOVE, options);
  const removeUoms = (options?: MutationFunctionOptions) => {
    _removeUoms({
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
          description: t('uom-removed'),
          variant: 'default',
        });
        options?.onCompleted?.(data);
      },
      refetchQueries: ['Uoms'],
    });
  };
  return {
    removeUoms,
    loading,
    error,
  };
};
