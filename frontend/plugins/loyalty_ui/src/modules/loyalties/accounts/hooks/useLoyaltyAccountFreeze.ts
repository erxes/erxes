import { ApolloError, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { LOYALTY_ACCOUNT_FREEZE, LOYALTY_ACCOUNT_UNFREEZE } from '../graphql';

export const useLoyaltyAccountFreeze = () => {
  const { t } = useTranslation('loyalty');
  const { toast } = useToast();
  const onError = (error: ApolloError) =>
    toast({
      title: t('error'),
      description: error.message,
      variant: 'destructive',
    });

  const [freezeMutation, { loading: freezing }] = useMutation(
    LOYALTY_ACCOUNT_FREEZE,
    { refetchQueries: ['LoyaltyAccountOfOwner', 'LoyaltyAccounts'] },
  );
  const [unfreezeMutation, { loading: unfreezing }] = useMutation(
    LOYALTY_ACCOUNT_UNFREEZE,
    { refetchQueries: ['LoyaltyAccountOfOwner', 'LoyaltyAccounts'] },
  );

  const freeze = (_id: string, reason: string, onDone?: () => void) =>
    freezeMutation({
      variables: { _id, reason },
      onCompleted: () => {
        toast({ title: t('loyalty-account-frozen'), variant: 'success' });
        onDone?.();
      },
      onError,
    });

  const unfreeze = (_id: string) =>
    unfreezeMutation({
      variables: { _id },
      onCompleted: () =>
        toast({ title: t('loyalty-account-unfrozen'), variant: 'success' }),
      onError,
    });

  return { freeze, unfreeze, loading: freezing || unfreezing };
};
