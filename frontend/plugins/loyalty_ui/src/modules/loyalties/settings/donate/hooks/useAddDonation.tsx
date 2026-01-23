import { useMutation, MutationHookOptions } from '@apollo/client';
import { useRecordTableCursor, useToast } from 'erxes-ui';
import { addDonationMutation } from '../graphql/mutations/DonationMutations';
import { getCampaignsQuery } from '../add-donation-campaign/graphql/queries/getCampaignsQuery';
import { DONATIONS_CURSOR_SESSION_KEY } from '../constants/donationsCursorSessionKey';
import { DONATIONS_PER_PAGE } from './useDonations';

export interface AddDonationResult {
  createCampaign: any;
}

export interface AddDonationVariables {
  name: string;
  kind: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  title?: string;
  conditions?: {
    voucherCampaignId?: string;
    minScore?: number;
    maxScore?: number;
  };
}

export const useAddDonation = () => {
  const { toast } = useToast();
  const { cursor } = useRecordTableCursor({
    sessionKey: DONATIONS_CURSOR_SESSION_KEY,
  });
  const [addDonation, { loading, error }] = useMutation<
    AddDonationResult,
    AddDonationVariables
  >(addDonationMutation, {
    refetchQueries: [
      {
        query: getCampaignsQuery,
        variables: { kind: 'donation', limit: DONATIONS_PER_PAGE, cursor },
      },
    ],
    update: (cache, { data }) => {
      try {
        const newCampaign = data?.createCampaign;

        if (!newCampaign) {
          return;
        }

        const existingData: any = cache.readQuery({
          query: getCampaignsQuery,
          variables: {
            kind: 'donation',
            limit: DONATIONS_PER_PAGE,
            cursor,
          },
        });

        if (!existingData?.getCampaigns) {
          return;
        }

        cache.writeQuery({
          query: getCampaignsQuery,
          variables: {
            kind: 'donation',
            limit: DONATIONS_PER_PAGE,
            cursor,
          },
          data: {
            getCampaigns: {
              ...existingData.getCampaigns,
              list: [newCampaign, ...existingData.getCampaigns.list],
              totalCount: (existingData.getCampaigns.totalCount || 0) + 1,
            },
          },
        });
      } catch (e) {
        console.error('Cache update error:', e);
      }
    },
  });

  const donationAdd = async (
    options: MutationHookOptions<AddDonationResult, AddDonationVariables>,
  ) => {
    return addDonation({
      ...options,
      onCompleted: (data) => {
        toast({
          title: 'Success',
          description: 'Donation campaign created successfully',
          variant: 'default',
        });
        options?.onCompleted?.(data);
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        options?.onError?.(error);
      },
    });
  };

  return {
    donationAdd,
    loading,
    error,
  };
};
