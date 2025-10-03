import { OperationVariables, useMutation } from '@apollo/client';
import { ACCOUNTS_REMOVE } from '../graphql/mutations/accounts';
import { GET_ACCOUNTS } from '../graphql/queries/getAccounts';
import { ACCOUNTS_PER_PAGE } from './useAccounts';
import { IAccount } from '../types/Account';

export const useAccountsRemove = () => {
  const [_removeAccounts, { loading }] = useMutation(ACCOUNTS_REMOVE);

  const removeAccounts = (options: OperationVariables) => {
    return _removeAccounts({
      ...options,
      update: (cache) => {
        try {
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
              accounts: existingData.accounts.filter(
                (account: IAccount) =>
                  !options.variables.accountIds.includes(account._id),
              ),
            },
          });
        } catch (error) {
          console.error(error);
        }
      },
    });
  };

  return {
    removeAccounts,
    loading,
  };
};
