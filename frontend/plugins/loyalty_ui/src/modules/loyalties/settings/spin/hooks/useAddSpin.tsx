import { MutationHookOptions, useMutation } from '@apollo/client';
import { useRecordTableCursor, useToast } from 'erxes-ui';
import { QUERY_SPIN_CAMPAIGNS } from '../add-spin-campaign/graphql/queries/getCampaignsQuery';
import { SPINS_CURSOR_SESSION_KEY } from '../constants/spinsCursorSessionKey';
import { CREATE_SPIN_CAMPAIGN } from '../graphql/mutations/SpinMutations';
import { SPINS_PER_PAGE } from './useSpins';

export interface AddSpinResult {
  spinCampaignsAdd: any;
}

export interface AddSpinVariables {
  name: string;
  kind: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  title?: string;
  buyScore?: number;
  awards?: Array<{
    name?: string;
    voucherCampaignId?: string;
    probablity?: string;
  }>;
}

export const useAddSpin = () => {
  const { toast } = useToast();
  const { cursor } = useRecordTableCursor({
    sessionKey: SPINS_CURSOR_SESSION_KEY,
  });
  const [addSpin, { loading, error }] = useMutation<
    AddSpinResult,
    AddSpinVariables
  >(CREATE_SPIN_CAMPAIGN, {
    refetchQueries: [
      {
        query: QUERY_SPIN_CAMPAIGNS,
        variables: { limit: SPINS_PER_PAGE, cursor },
      },
    ],
    update: (cache, { data }) => {
      try {
        const newCampaign = data?.spinCampaignsAdd;

        if (!newCampaign) {
          return;
        }

        const existingData: any = cache.readQuery({
          query: QUERY_SPIN_CAMPAIGNS,
          variables: {
            limit: SPINS_PER_PAGE,
            cursor,
          },
        });

        if (!existingData?.spinCampaigns) {
          return;
        }

        cache.writeQuery({
          query: QUERY_SPIN_CAMPAIGNS,
          variables: {
            limit: SPINS_PER_PAGE,
            cursor,
          },
          data: {
            spinCampaigns: {
              ...existingData.spinCampaigns,
              list: [newCampaign, ...existingData.spinCampaigns.list],
              totalCount: (existingData.spinCampaigns.totalCount || 0) + 1,
            },
          },
        });
      } catch (e) {
        console.error('Cache update error:', e);
      }
    },
  });

  const spinAdd = async (
    options: MutationHookOptions<AddSpinResult, AddSpinVariables>,
  ) => {
    return addSpin({
      ...options,
      onCompleted: (data) => {
        toast({
          title: 'Success',
          description: 'Spin campaign created successfully',
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
    spinAdd,
    loading,
    error,
  };
};
