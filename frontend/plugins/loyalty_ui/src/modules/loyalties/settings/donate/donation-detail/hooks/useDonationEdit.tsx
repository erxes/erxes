import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { editDonationStatusMutation } from '../../graphql/mutations/donationEditStatusMutations';

export interface EditDonationVariables {
  id: string;
  name?: string;
  kind?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  type?: string;
  amount?: number;
  maxScore?: number;
  conditions?: {
    voucherCampaignId?: string;
    minScore?: number;
  };
}

export const useDonationEdit = () => {
  const { toast } = useToast();

  const [donationEdit, { loading }] = useMutation<any, EditDonationVariables>(
    editDonationStatusMutation,
    {
      refetchQueries: ['getCampaigns'],
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Donation updated successfully',
          variant: 'default',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    },
  );

  return { donationEdit, loading };
};
