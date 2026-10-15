import type { ApolloError } from '@apollo/client';
import type { GraphqlMutationOptions } from '@/utils/graphqlMutation';
import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { RESERVE_REMS_REMOVE } from '../graphql/reserveRemMutations';

export const useReserveRemsRemove = () => {
  const { t } = useTranslation('accounting');
  const [_removeReserveRems, { loading }] = useMutation(RESERVE_REMS_REMOVE);

  const removeReserveRems = (
    options: GraphqlMutationOptions<typeof RESERVE_REMS_REMOVE>,
  ) => {
    return _removeReserveRems({
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
          description: t('reserve-remainder-deleted'),
        });
        options?.onCompleted?.(data);
      },
      refetchQueries: ['accountingReserveRems'],
    });
  };

  return {
    removeReserveRems,
    loading,
  };
};
