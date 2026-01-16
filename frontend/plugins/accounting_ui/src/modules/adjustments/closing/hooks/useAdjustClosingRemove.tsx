import { OperationVariables, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router';
import { ADJUST_CLOSING_ENTRY_REMOVE } from '../graphql/adjustClosingRemove';
import { toast } from 'erxes-ui';
import { ADJUST_CLOSING_QUERY } from '../graphql/adjustClosingQueries';
import { ACC_TRS__PER_PAGE } from '~/modules/transactions/types/constants';

export const useAdjustClosingEntryRemove = (
  adjustId: string,
  options?: OperationVariables,
) => {
  const navigate = useNavigate();
  const [_removeMutation, { loading }] = useMutation(
    ADJUST_CLOSING_ENTRY_REMOVE,
    options,
  );

  const removeAdjust = (options?: OperationVariables) => {
    return _removeMutation({
      ...options,
      variables: {
        adjustId,
        ...options?.variables,
      },
      onError: (error: Error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        options?.onError?.(error);
      },
      onCompleted: (data) => {
        toast({
          title: 'Success',
          description: 'Closing adjust running successfully',
        });
        options?.onCompleted?.(data);
      },
      refetchQueries: [
        {
          query: ADJUST_CLOSING_QUERY,
          variables: {
            ...options?.variables,
            page: 1,
            perPage: ACC_TRS__PER_PAGE,
          },
        },
      ],
      awaitRefetchQueries: true,
      update: (cache) => {
        const pathname = '/accounting/adjustment/closing';
        navigate(pathname);
      },
    });
  };

  return {
    removeAdjust,
    loading,
  };
};
