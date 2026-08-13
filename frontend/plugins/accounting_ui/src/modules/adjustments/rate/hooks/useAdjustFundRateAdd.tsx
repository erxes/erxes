import { OperationVariables, useMutation } from '@apollo/client';
import { ADJUST_FUND_RATE_ADD } from '../graphql/adjustFundRateAdd';
import { toast } from 'erxes-ui';
import { useNavigate } from 'react-router-dom';
import { ADJUST_FUND_RATE_QUERY } from '../graphql/adjustFundRateQueries';

export const useAdjustFundRateAdd = (options?: OperationVariables) => {
  const navigate = useNavigate();

  const [_addAdjustFundRate, { loading }] = useMutation(
    ADJUST_FUND_RATE_ADD,
    options,
  );

  const addAdjustFundRate = (options?: OperationVariables) => {
    return _addAdjustFundRate({
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
          description: 'Fund Rate Adjustment created successfully',
        });
        options?.onCompleted?.();
      },
      refetchQueries: [
        {
          query: ADJUST_FUND_RATE_QUERY,
          variables: {
            limit: 20,
            cursor: null,
            orderBy: { createdAt: -1 },
          },
        },
      ],
      awaitRefetchQueries: true,
      update: (_cache, { data }) => {
        const newId = data?.adjustFundRateAdd?._id;

        const pathname = newId
          ? `/accounting/adjustment/fundRate/detail?id=${newId}`
          : '/accounting/adjustment/fundRate';

        navigate(pathname);
      },
    });
  };

  return { addAdjustFundRate, loading };
};
