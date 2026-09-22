import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SPINS_ADD_MUTATION } from '../graphql/mutations/mutations';

export const useAddSpin = () => {
  const { t } = useTranslation('loyalty');
  const { toast } = useToast();

  const [addSpin, { loading, error }] = useMutation(SPINS_ADD_MUTATION, {
    refetchQueries: ['SpinsMain'],
  });

  const spinAdd = async (variables: {
    campaignId?: string;
    ownerId?: string;
    ownerType?: string;
    status?: string;
    voucherCampaignId?: string;
  }) => {
    return addSpin({
      variables,
      onCompleted: () => {
        toast({
          title: t('success'),
          description: t('spin-created'),
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

  return { spinAdd, loading, error };
};
