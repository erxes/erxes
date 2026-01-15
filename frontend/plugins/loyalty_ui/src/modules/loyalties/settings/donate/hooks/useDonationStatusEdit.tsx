import { useMutation } from '@apollo/client';
import { MutationHookOptions } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { getCampaignsQuery } from '../add-donation-campaign/graphql/queries/getCampaignsQuery';
import { editDonationStatusMutation } from '../graphql/mutations/donationEditStatusMutations';

export function useDonationStatusEdit() {
  const { toast } = useToast();

  const [editDonation, { loading, error }] = useMutation(
    editDonationStatusMutation,
    {
      refetchQueries: [
        {
          query: getCampaignsQuery,
        },
      ],
    },
  );

  const editStatus = async (options: MutationHookOptions<any, any>) => {
    const { variables } = options;

    return editDonation({
      variables: {
        id: variables._id,
        kind: 'donation',
        status: variables.status,
      },
      onCompleted: (data) => {
        toast({
          title: 'Success',
          description: 'Donation status updated successfully',
          variant: 'default',
        });
        options?.onCompleted?.(data);
      },
      onError: (err) => {
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        });
        options?.onError?.(err);
      },
    });
  };

  return { editStatus, loading, error };
}
