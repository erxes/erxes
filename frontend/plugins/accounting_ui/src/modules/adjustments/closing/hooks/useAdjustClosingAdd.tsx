import { OperationVariables, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router';
import { ADJUST_CLOSING_ADD } from '../graphql/adjustClosingAdd';
import { toast } from 'erxes-ui';
import { ADJUST_CLOSING_QUERY } from '../graphql/adjustClosingQueries';

export const useAdjustClosingAdd = (options?: OperationVariables) => {
  const navigate = useNavigate();

  const [_addAdjustClosing, { loading }] = useMutation(
    ADJUST_CLOSING_ADD,
    options,
  );

  const addAdjustClosing = (options?: OperationVariables) => {
    return _addAdjustClosing({
      ...options,
      onError: (error: Error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        options?.onError?.(error);
      },
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Adjust Closing created successfully',
        });
        options?.onCompleted();
      },
      refetchQueries: [
        {
          query: ADJUST_CLOSING_QUERY,
          variables: {
            page: 1,
            perPage: 20,
          },
        },
      ],
      awaitRefetchQueries: true,
      update: (_cache, { data }) => {
        const newId = data?.adjustClosingAdd[0]?.id;

        const pathname = newId
          ? `/accounting/adjustment/closing/edit?id=${newId}`
          : '/accounting/adjustment/closing';

        navigate(pathname);
      },
    });
  };

  return {
    addAdjustClosing,
    loading,
  };
};
