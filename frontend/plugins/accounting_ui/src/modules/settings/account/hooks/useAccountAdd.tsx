import { OperationVariables, useMutation } from '@apollo/client';
import { recordTableCursorAtomFamily, toast } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { ACCOUNTS_CURSOR_SESSION_KEY } from '~/modules/accountsSessionKeys';
import { ACCOUNTS_ADD } from '../graphql/mutations/accounts';

export const useAccountAdd = () => {
  const setCursor = useSetAtom(recordTableCursorAtomFamily(ACCOUNTS_CURSOR_SESSION_KEY));

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
      onCompleted: (data) => {
        setCursor('');
        options?.onCompleted?.(data);
      },
      refetchQueries: ['AccountsMain'],
    });
  };

  return { addAccount, loading };
};
