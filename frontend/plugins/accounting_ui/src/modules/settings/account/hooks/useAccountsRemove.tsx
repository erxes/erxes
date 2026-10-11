import type { GraphqlMutationOptions } from '@/utils/graphqlMutation';
import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { ACCOUNTS_REMOVE } from '../graphql/mutations/accounts';

export const useAccountsRemove = () => {
  const [_removeAccounts, { loading }] = useMutation(ACCOUNTS_REMOVE);

  const removeAccounts = (
    options: GraphqlMutationOptions<typeof ACCOUNTS_REMOVE>,
  ) => {
    return _removeAccounts({
      ...options,
      onError: (error) => {
        toast({
          title: 'Алдаа',
          description: error.message,
          variant: 'destructive',
        });
        options.onError?.(error);
      },
      onCompleted: (data) => {
        toast({
          title: 'Амжилттай',
          description: 'Дансыг устгалаа',
        });
        options.onCompleted?.(data);
      },
      refetchQueries: ['accountingAccountsMain'],
    });
  };

  return {
    removeAccounts,
    loading,
  };
};
