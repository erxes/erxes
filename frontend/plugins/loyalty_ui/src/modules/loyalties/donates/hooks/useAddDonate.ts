import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { DONATES_ADD_MUTATION } from '../graphql/mutations/mutations';

export const useAddDonate = () => {
  const { toast } = useToast();

  const [addDonate, { loading, error }] = useMutation(DONATES_ADD_MUTATION, {
    refetchQueries: ['DonatesMain'],
  });

  const donateAdd = async (variables: {
    campaignId?: string;
    ownerId?: string;
    ownerType?: string;
    status?: string;
    voucherCampaignId?: string;
    donateScore?: number;
  }) => {
    return addDonate({
      variables,
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Donation created successfully',
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

  return { donateAdd, loading, error };
};
