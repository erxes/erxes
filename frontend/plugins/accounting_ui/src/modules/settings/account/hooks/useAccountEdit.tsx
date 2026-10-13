import { useTranslation } from 'react-i18next';
import { OperationVariables, useMutation } from '@apollo/client';
import { ACCOUNTS_EDIT } from '../graphql/mutations/accounts';
import { toast } from 'erxes-ui';

export const useAccountEdit = () => {
  const { t } = useTranslation('accounting');
  const [_editAccount, { loading }] = useMutation(ACCOUNTS_EDIT);

  const editAccount = (options: OperationVariables, fields: string[]) => {
    const variables = options?.variables || {};
    const fieldsToUpdate: Record<string, () => any> = {};
    fields.forEach((field) => {
      fieldsToUpdate[field] = () => variables[field];
    });
    return _editAccount({
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
          description: t('account-updated-successfully'),
          variant: 'success',
        });
        options?.onCompleted?.(data);
      },
      refetchQueries: ['AccountsMain'],
    });
  };

  return {
    editAccount,
    loading,
  };
};
