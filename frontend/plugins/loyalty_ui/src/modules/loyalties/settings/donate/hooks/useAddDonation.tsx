import { MutationHookOptions, useMutation } from '@apollo/client';
import { useRecordTableCursor, useToast } from 'erxes-ui';
import { QUERY_DONATE_CAMPAIGNS } from '../add-donation-campaign/graphql/queries/getCampaignsQuery';
import { DONATIONS_CURSOR_SESSION_KEY } from '../constants/donationsCursorSessionKey';
import { CREATE_DONATE_CAMPAIGN } from '../graphql/mutations/DonationMutations';
import { DONATIONS_PER_PAGE } from './useDonations';

export interface AddDonationResult {
  createCampaign: any;
}

export interface AddDonationVariables {
  name: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  title?: string;
  voucherCampaignId?: string;
  minScore?: number;
  maxScore?: number;
}

export const useAddDonation = () => {
  const { toast } = useToast();
  const { cursor } = useRecordTableCursor({
    sessionKey: DONATIONS_CURSOR_SESSION_KEY,
  });
  const [addDonation, { loading, error }] = useMutation<
    AddDonationResult,
    AddDonationVariables
  >(CREATE_DONATE_CAMPAIGN, {
    refetchQueries: [
      {
        query: QUERY_DONATE_CAMPAIGNS,
        variables: { limit: DONATIONS_PER_PAGE, cursor },
      },
    ],
    update: (cache, { data }) => {
      try {
        const newCampaign = data?.createCampaign;

        if (!newCampaign) {
          return;
        }

        const existingData: any = cache.readQuery({
          query: QUERY_DONATE_CAMPAIGNS,
          variables: {
            limit: DONATIONS_PER_PAGE,
            cursor,
          },
        });

        if (!existingData?.donateCampaigns) {
          return;
        }

        cache.writeQuery({
          query: QUERY_DONATE_CAMPAIGNS,
          variables: {
            limit: DONATIONS_PER_PAGE,
            cursor,
          },
          data: {
            donateCampaigns: {
              ...existingData.donateCampaigns,
              list: [newCampaign, ...existingData.donateCampaigns.list],
              totalCount: (existingData.donateCampaigns.totalCount || 0) + 1,
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
