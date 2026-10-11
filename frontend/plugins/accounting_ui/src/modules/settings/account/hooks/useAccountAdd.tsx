import type { GraphqlMutationOptions } from '@/utils/graphqlMutation';
import { useMutation } from '@apollo/client';
import { recordTableCursorAtomFamily, toast } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { ACCOUNTS_CURSOR_SESSION_KEY } from '~/modules/accountsSessionKeys';
import { ACCOUNTS_ADD } from '../graphql/mutations/accounts';

export const useAccountAdd = () => {
  const setCursor = useSetAtom(
    recordTableCursorAtomFamily(ACCOUNTS_CURSOR_SESSION_KEY),
  );

  const [_addAccount, { loading }] = useMutation(ACCOUNTS_ADD);

  const addAccount = (options: GraphqlMutationOptions<typeof ACCOUNTS_ADD>) => {
    return _addAccount({
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
        setCursor('');
        options?.onCompleted?.(data);
      },
      refetchQueries: ['accountingAccountsMain'],
    });
  };

  return { addAccount, loading };
};
