import { useTranslation } from 'react-i18next';
import { OperationVariables, useMutation } from '@apollo/client';
import { ADJUST_FUND_RATE_CHANGE } from '../graphql/adjustFundRateChange';
import { toast } from 'erxes-ui';
import { ADJUST_FUND_RATE_QUERY } from '../graphql/adjustFundRateQueries';

export const useAdjustFundRateChange = () => {
  const { t } = useTranslation('accounting');

  const [mutate, { loading }] = useMutation(ADJUST_FUND_RATE_CHANGE);

  const changeAdjustFundRate = (options?: OperationVariables) => {
    return mutate({
      ...options,
      onError: (error: Error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
      onCompleted: () => {
        toast({
          title: t('success'),
          description: t('updated-successfully'),
        });
        options?.onCompleted?.();
      },
      refetchQueries: [ADJUST_FUND_RATE_QUERY],
    });
  };

  return { changeAdjustFundRate, loading };
};
