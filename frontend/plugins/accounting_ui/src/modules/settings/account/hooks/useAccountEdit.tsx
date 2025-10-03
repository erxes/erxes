import { OperationVariables, useMutation } from '@apollo/client';
import { ACCOUNTS_EDIT } from '../graphql/mutations/accounts';
import { toast } from 'erxes-ui';

export const useAccountEdit = () => {
  const [_editAccount, { loading }] = useMutation(ACCOUNTS_EDIT);

  const editAccount = (
    operationVariables: OperationVariables,
    fields: string[],
  ) => {
    const variables = operationVariables?.variables || {};
    const fieldsToUpdate: Record<string, () => any> = {};
    fields.forEach((field) => {
      fieldsToUpdate[field] = () => variables[field];
    });
    return _editAccount({
      ...operationVariables,
      variables,
      update: (cache, { data: { accountsEdit } }) => {
        try {
          cache.modify({
            id: cache.identify(accountsEdit),
            fields: fieldsToUpdate,
            optimistic: true,
          });
        } catch (error) {
          console.error(error);
        }
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return {
    editAccount,
    loading,
  };
};
