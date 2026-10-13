import type { ApolloError } from '@apollo/client';
import type { GraphqlMutationOptions } from '@/utils/graphqlMutation';
import { useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { ADJUST_DEBT_RATE_ADD } from '../graphql/adjustDebtRateAdd';
import { toast } from 'erxes-ui';
import { ADJUST_DEBT_RATE_QUERY } from '../graphql/adjustDebtRateQueries';

export const useAdjustDebtRateAdd = (
  options?: GraphqlMutationOptions<typeof ADJUST_DEBT_RATE_ADD>,
) => {
  const { t } = useTranslation('accounting');
  const [_addAdjustDebtRate, { loading }] = useMutation(
    ADJUST_DEBT_RATE_ADD,
    options,
  );

  const addAdjustDebtRate = (
    options?: GraphqlMutationOptions<typeof ADJUST_DEBT_RATE_ADD>,
  ) => {
    return _addAdjustDebtRate({
      ...options,
      onError: (error: ApolloError) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
        options?.onError?.(error);
      },
      onCompleted: (data) => {
        toast({
          title: t('success'),
          description: t('Debt Rate Adjustment created successfully'),
        });
        options?.onCompleted?.(data);
      },
      refetchQueries: [
        {
          query: ADJUST_DEBT_RATE_QUERY,
          variables: {
            limit: 20,
            cursor: null,
            orderBy: { createdAt: -1 },
          },
        },
      ],
      awaitRefetchQueries: true,
    });
  };

  return {
    addAdjustDebtRate,
    loading,
  };
};
