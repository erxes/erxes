import { OperationVariables, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { ACCOUNTS_REMOVE } from '../graphql/mutations/accounts';

export const useAccountsRemove = () => {
  const [_removeAccounts, { loading }] = useMutation(ACCOUNTS_REMOVE);

  const removeAccounts = (options: OperationVariables) => {
    return _removeAccounts({
      ...options,
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        options.onError?.(error);
      },
      onCompleted: (data) => {
        toast({
          title: 'Success',
          description: 'Accounts deleted successfully',
        });
        options.onCompleted?.(data);
      },
      refetchQueries: ['AccountsMain'],
    });
  };

  return {
    removeAccounts,
    loading,
  };
};
