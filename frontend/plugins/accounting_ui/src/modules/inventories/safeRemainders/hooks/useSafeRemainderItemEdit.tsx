import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SAFE_REMAINDER_ITEM_EDIT } from '../graphql/safeRemainderChange';
import type {
  AccountingSafeRemainderItemEditMutation,
  AccountingSafeRemainderItemEditMutationVariables,
} from '~/gql/graphql';

export const useSafeRemainderItemEdit = () => {
  const { t } = useTranslation('accounting');
  const [_editRemItem, { loading }] = useMutation(SAFE_REMAINDER_ITEM_EDIT);

  const editRemItem = (
    options: MutationFunctionOptions<
      AccountingSafeRemainderItemEditMutation,
      AccountingSafeRemainderItemEditMutationVariables
    >,
  ) => {
    const variables = options.variables;
    if (!variables?._id) throw new Error('Item id is required');
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
      refetchQueries: ['accountingSafeRemainderItems'],
    });
  };

  return {
    editRemItem,
    loading,
  };
};
