import { OperationVariables, useMutation } from '@apollo/client';
import { ACCOUNTS_ADD } from '../graphql/mutations/accounts';
import { toast } from 'erxes-ui';
import { GET_ACCOUNTS } from '../graphql/queries/getAccounts';
import { ACCOUNTS_PER_PAGE } from './useAccounts';
import { IAccount } from '../types/Account';

export const useAccountAdd = () => {
  const [_addAccount, { loading }] = useMutation(ACCOUNTS_ADD);

  const addAccount = (options: OperationVariables) => {
    return _addAccount({
      ...options,
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        options.onError?.(error);
      },
      update: (cache, { data }) => {
        const queryVariables = { perPage: ACCOUNTS_PER_PAGE, page: 1 };
        const existingData = cache.readQuery<{ accounts: IAccount[] }>({
          query: GET_ACCOUNTS,
          variables: queryVariables,
        });
        if (!existingData || !existingData.accounts) return;

        cache.writeQuery({
          query: GET_ACCOUNTS,
          variables: queryVariables,
          data: {
            ...existingData,
            accounts: [data.accountsAdd, ...existingData.accounts],
          },
        });
      },
    });
  };

  return { addAccount, loading };
};
