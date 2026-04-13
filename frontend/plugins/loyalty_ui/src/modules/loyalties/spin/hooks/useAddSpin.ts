import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { SPINS_ADD_MUTATION } from '../graphql/mutations/mutations';

export const useAddSpin = () => {
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
          title: 'Success',
          description: 'Spin created successfully',
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

  return { spinAdd, loading, error };
};
