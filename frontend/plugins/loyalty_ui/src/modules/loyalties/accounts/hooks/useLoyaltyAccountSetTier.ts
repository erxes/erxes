import { ApolloError, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { LOYALTY_ACCOUNT_SET_TIER } from '../graphql';

export const useLoyaltyAccountSetTier = () => {
  const { t } = useTranslation('loyalty');
  const { toast } = useToast();
  const [mutate, { loading }] = useMutation(LOYALTY_ACCOUNT_SET_TIER, {
    refetchQueries: [
      'LoyaltyAccountOfOwner',
      'LoyaltyAccounts',
      'LoyaltyTierLogs',
    ],
  });

  const setTier = ({
    accountId,
    accountTypeId,
    tier,
  }: {
    accountId: string;
    accountTypeId: string;
    tier: string | null;
  }) =>
    mutate({
      variables: { _id: accountId, accountTypeId, tier },
      onCompleted: () =>
        toast({ title: t('loyalty-tier-changed'), variant: 'success' }),
      onError: (error: ApolloError) =>
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        }),
    });

  return { setTier, loading };
};
