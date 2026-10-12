import type { ApolloError } from '@apollo/client';
import type { GraphqlMutationOptions } from '@/utils/graphqlMutation';
import { useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import {
  ADJUST_DEBT_RATE_CHANGE,
  ADJUST_DEBT_RATE_REMOVE,
} from '../graphql/adjustDebtRateChange';
import { toast } from 'erxes-ui';
import { ADJUST_DEBT_RATE_QUERY } from '../graphql/adjustDebtRateQueries';
import { useNavigate } from 'react-router-dom';

export const useAdjustDebtRateChange = (
  options?: GraphqlMutationOptions<typeof ADJUST_DEBT_RATE_CHANGE>,
) => {
  const { t } = useTranslation('accounting');
  const [_changeAdjustDebtRate, { loading }] = useMutation(
    ADJUST_DEBT_RATE_CHANGE,
    options,
  );

  const changeAdjustDebtRate = (
    options?: GraphqlMutationOptions<typeof ADJUST_DEBT_RATE_CHANGE>,
  ) => {
    return _changeAdjustDebtRate({
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
          description: t('Debt Rate Adjustment updated successfully'),
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
    changeAdjustDebtRate,
    loading,
  };
};

export const useAdjustDebtRateRemove = (
  options?: GraphqlMutationOptions<typeof ADJUST_DEBT_RATE_REMOVE>,
) => {
  const { t } = useTranslation('accounting');
  const navigate = useNavigate();
  const [_removeAdjustDebtRate, { loading }] = useMutation(
    ADJUST_DEBT_RATE_REMOVE,
    options,
  );

  const removeAdjustDebtRate = (
    options?: GraphqlMutationOptions<typeof ADJUST_DEBT_RATE_REMOVE>,
  ) => {
    return _removeAdjustDebtRate({
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
          description: t('Debt Rate Adjustment removed successfully'),
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
      update: () => {
        const pathname = '/accounting/adjustment/debRate';
        navigate(pathname);
      },
    });
  };

  return {
    removeAdjustDebtRate,
    loading,
  };
};
