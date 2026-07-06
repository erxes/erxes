import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SPINS_EDIT_MUTATION } from '../graphql/mutations/mutations';

export const useEditSpin = () => {
  const { t } = useTranslation('loyalty');
  const { toast } = useToast();

  const [editSpin, { loading, error }] = useMutation(SPINS_EDIT_MUTATION, {
    refetchQueries: ['SpinsMain'],
  });

  const spinEdit = async (variables: {
    _id: string;
    campaignId?: string;
    ownerId?: string;
    ownerType?: string;
    status?: string;
    voucherCampaignId?: string;
  }) => {
    return editSpin({
      variables,
      onCompleted: () => {
        toast({
          title: t('success', 'Success'),
          description: t('spin-updated', 'Spin updated successfully'),
          variant: 'default',
        });
      },
      onError: (err) => {
        toast({
          title: t('error', 'Error'),
          description: err.message,
          variant: 'destructive',
        });
      },
    });
  };

  return { spinEdit, loading, error };
};
