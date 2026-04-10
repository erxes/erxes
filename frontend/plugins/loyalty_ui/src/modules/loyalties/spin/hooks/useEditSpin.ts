import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { SPINS_EDIT_MUTATION } from '../graphql/mutations/mutations';

export const useEditSpin = () => {
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
          title: 'Success',
          description: 'Spin updated successfully',
          variant: 'default',
        });
      },
      onError: (err) => {
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        });
      },
    });
  };

  return { spinEdit, loading, error };
};
