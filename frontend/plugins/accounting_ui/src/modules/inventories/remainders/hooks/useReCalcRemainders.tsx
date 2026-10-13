import type { ApolloError } from '@apollo/client';
import type { GraphqlMutationOptions } from '@/utils/graphqlMutation';
import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { RE_CALC_REMAINDERS } from '../graphql';

export const useReCalcRemainders = (
  options?: GraphqlMutationOptions<typeof RE_CALC_REMAINDERS>,
) => {
  const { t } = useTranslation('accounting');
  const [_addSafeRemainder, { loading }] = useMutation(
    RE_CALC_REMAINDERS,
    options,
  );

  const addSafeRemainder = (
    options?: GraphqlMutationOptions<typeof RE_CALC_REMAINDERS>,
  ) => {
    return _addSafeRemainder({
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
          description: t('re-calced-successfully'),
        });
        options?.onCompleted?.(data);
      },
      refetchQueries: ['accountingProductsRemainderMain'],
    });
  };

  return {
    addSafeRemainder,
    loading,
  };
};
