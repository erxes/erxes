import type { ApolloError } from '@apollo/client';
import type { GraphqlMutationOptions } from '@/utils/graphqlMutation';
import { useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { ADJUST_FUND_RATE_REMOVE } from '../graphql/adjustFundRateRemove';
import { toast } from 'erxes-ui';
import { ADJUST_FUND_RATE_QUERY } from '../graphql/adjustFundRateQueries';
import { useNavigate } from 'react-router-dom';

export const useAdjustFundRateRemove = (
  options?: GraphqlMutationOptions<typeof ADJUST_FUND_RATE_REMOVE>,
) => {
  const { t } = useTranslation('accounting');
  const navigate = useNavigate();
  const [_removeAdjustFundRate, { loading }] = useMutation(
    ADJUST_FUND_RATE_REMOVE,
    options,
  );

  const removeAdjustFundRate = (
    options?: GraphqlMutationOptions<typeof ADJUST_FUND_RATE_REMOVE>,
  ) => {
    return _removeAdjustFundRate({
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
          description: t('Fund Rate Adjustment removed successfully'),
        });
        options?.onCompleted?.(data);
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
      update: (cashe) => {
        const pathname = '/accounting/adjustment/fundRate';
        navigate(pathname);
      },
    });
  };

  return { removeAdjustFundRate, loading };
};
