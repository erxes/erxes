import { OperationVariables, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SAFE_REMAINDER_ITEM_EDIT } from '../graphql/safeRemainderChange';

export const useSafeRemainderItemEdit = () => {
  const { t } = useTranslation('accounting');
  const [_editRemItem, { loading }] = useMutation(SAFE_REMAINDER_ITEM_EDIT);

  const editRemItem = (options: OperationVariables, fields: string[]) => {
    const variables = options?.variables || {};
    const fieldsToUpdate: Record<string, () => any> = {};
    fields.forEach((field) => {
      fieldsToUpdate[field] = () => variables[field];
    });
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
