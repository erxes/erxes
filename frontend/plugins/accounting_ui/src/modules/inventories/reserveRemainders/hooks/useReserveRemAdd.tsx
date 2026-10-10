import type { ApolloError } from '@apollo/client';
import type { GraphqlMutationOptions } from '@/utils/graphqlMutation';
import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { RESERVE_REMS_ADD } from '../graphql/reserveRemMutations';

export const useReserveRemAdd = (
  options?: GraphqlMutationOptions<typeof RESERVE_REMS_ADD>,
) => {
  const { t } = useTranslation('accounting');
  const [_addReserveRem, { loading }] = useMutation(RESERVE_REMS_ADD, options);

  const addReserveRem = (
    options?: GraphqlMutationOptions<typeof RESERVE_REMS_ADD>,
  ) => {
    return _addReserveRem({
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
          description: t('reserve-remainder-created'),
        });
        options?.onCompleted?.(data);
      },
      refetchQueries: ['accountingReserveRems'],
    });
  };

  return {
    addReserveRem,
    loading,
  };
};
