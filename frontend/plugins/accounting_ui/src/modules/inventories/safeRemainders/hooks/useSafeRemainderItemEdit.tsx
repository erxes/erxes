import {
  MutationFunctionOptions,
  OperationVariables,
  useMutation,
} from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SAFE_REMAINDER_ITEM_EDIT } from '../graphql/safeRemainderChange';
import { ISafeRemainderItem } from '../types/SafeRemainder';

export const useSafeRemainderItemEdit = () => {
  const { t } = useTranslation('accounting');
  const [_editRemItem, { loading }] = useMutation<
    { safeRemainderItemEdit: ISafeRemainderItem },
    OperationVariables
  >(SAFE_REMAINDER_ITEM_EDIT);

  const editRemItem = (
    options: MutationFunctionOptions<
      { safeRemainderItemEdit: ISafeRemainderItem },
      OperationVariables
    >,
  ) => {
    const variables = options?.variables || {};
    return _editRemItem({
      ...options,
      variables,
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
        options.onError?.(error);
      },
      onCompleted: (data) => {
        toast({
          title: t('success'),
          description: t('item-updated'),
          variant: 'success',
        });
        options?.onCompleted?.(data);
      },
      refetchQueries: ['SafeRemainderItems'],
    });
  };

  return {
    editRemItem,
    loading,
  };
};
