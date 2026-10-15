import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type { LotteriesAddMutationVariables } from '~/gql/graphql';
import { LOTTERIES_ADD_MUTATION } from '../graphql/mutations/mutations';

export const useAddLottery = () => {
  const { toast } = useToast();
  const { t } = useTranslation('loyalty');

  const [addLottery, { loading, error }] = useMutation(LOTTERIES_ADD_MUTATION, {
    refetchQueries: ['LotteriesMain'],
  });

  const lotteryAdd = async (variables: LotteriesAddMutationVariables) => {
    return addLottery({
      variables,
      onCompleted: () => {
        toast({
          title: t('success'),
          description: t('lottery-created'),
          variant: 'default',
        });
      },
      onError: (err) => {
        toast({
          title: t('error'),
          description: err.message,
          variant: 'destructive',
        });
      },
    });
  };

  return { lotteryAdd, loading, error };
};
