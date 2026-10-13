import type { ApolloError } from '@apollo/client';
import type { GraphqlMutationOptions } from '@/utils/graphqlMutation';
import { useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { ADJUST_FUND_RATE_CHANGE } from '../graphql/adjustFundRateChange';
import { toast } from 'erxes-ui';
import { ADJUST_FUND_RATE_QUERY } from '../graphql/adjustFundRateQueries';

export const useAdjustFundRateChange = () => {
  const { t } = useTranslation('accounting');
  const [mutate, { loading }] = useMutation(ADJUST_FUND_RATE_CHANGE);

  const changeAdjustFundRate = (
    options?: GraphqlMutationOptions<typeof ADJUST_FUND_RATE_CHANGE>,
  ) => {
    return mutate({
      ...options,
      onError: (error: ApolloError) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
      onCompleted: (data) => {
        toast({
          title: t('success'),
          description: t('Updated successfully'),
        });
        options?.onCompleted?.(data);
      },
      refetchQueries: [ADJUST_FUND_RATE_QUERY],
    });
  };

  return { changeAdjustFundRate, loading };
};
