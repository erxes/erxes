import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { DONATES_EDIT_MUTATION } from '../graphql/mutations/mutations';

export const useEditDonate = () => {
  const { toast } = useToast();

  const [editDonate, { loading, error }] = useMutation(DONATES_EDIT_MUTATION, {
    refetchQueries: ['DonatesMain'],
  });

  const donateEdit = async (variables: {
    _id: string;
    campaignId?: string;
    ownerId?: string;
    ownerType?: string;
    status?: string;
    voucherCampaignId?: string;
    donateScore?: number;
  }) => {
    return editDonate({
      variables,
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Donation updated successfully',
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

  return { donateEdit, loading, error };
};
