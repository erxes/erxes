import type { GraphqlMutationOptions } from '@/utils/graphqlMutation';
import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SAFE_REMAINDER_ITEMS_REMOVE } from '../graphql/safeRemainderChange';

export const useSafeRemainderItemsRemove = () => {
  const { t } = useTranslation('accounting');
  const [_removeRemItems, { loading }] = useMutation(
    SAFE_REMAINDER_ITEMS_REMOVE,
  );

  const removeRemItems = (
    options: GraphqlMutationOptions<typeof SAFE_REMAINDER_ITEMS_REMOVE>,
  ) => {
    const variables = options?.variables;
    if (!variables?.ids?.length)
      throw new Error('Safe remainder item ids are required');

    return _removeRemItems({
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
      refetchQueries: ['accountingSafeRemainderItems'],
    });
  };

  return {
    removeRemItems,
    loading,
  };
};
