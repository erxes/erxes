import { OperationVariables, useMutation } from '@apollo/client';
import { SAFE_REMAINDER_SUBMIT } from '../graphql/safeRemainderChange';
import { toast } from 'erxes-ui';
import {
  SAFE_REMAINDER_DETAIL_QUERY,
  SAFE_REMAINDER_DETAILS_QUERY,
} from '../graphql/safeRemainderQueries';
import { ACC_TRS__PER_PAGE } from '@/transactions/types/constants';

export const useSafeRemainderSubmit = (
  _id: string,
  options?: OperationVariables,
) => {
  const [submitMutation, { loading }] = useMutation(
    SAFE_REMAINDER_SUBMIT,
    options,
  );

  const submitSafeRemainder = (options?: OperationVariables) => {
    return submitMutation({
      ...options,
      variables: {
        _id,
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
          description: 'Inventory safe remainder submited successfully',
        });
        options?.onCompleted?.(data);
      },
      refetchQueries: [
        {
          query: SAFE_REMAINDER_DETAIL_QUERY,
          variables: {
            _id,
          },
        },
        {
          query: SAFE_REMAINDER_DETAILS_QUERY,
          variables: {
            _id,
            page: 1,
            perPage: ACC_TRS__PER_PAGE,
          },
        },
      ],
      awaitRefetchQueries: true,
    });
  };

  return {
    submitSafeRemainder,
    loading,
  };
};
