import { MutationHookOptions, useMutation } from '@apollo/client';
import { useRecordTableCursor, useToast } from 'erxes-ui';
import { QUERY_LOTTERY_CAMPAIGNS } from '../add-lottery-campaign/graphql/queries/getCampaignsQuery';
import { LOTTERY_CURSOR_SESSION_KEY } from '../constants/lotteryCursorSessionKey';
import { CREATE_LOTTERY_CAMPAIGN } from '../graphql/mutations/LotteryMutations';
import { LOTTERY_PER_PAGE } from './useLotteries';

export interface AddLotteryResult {
  lotteryCampaignsAdd: any;
}

export interface AddLotteryVariables {
  status?: string;
  startDate?: string;
  endDate?: string;
  title?: string;
  awards?: {
    name?: string;
    voucherCampaignId?: string;
    probablity?: string;
    buyScore?: number;
  };
}

export const useAddLottery = () => {
  const { toast } = useToast();
  const { cursor } = useRecordTableCursor({
    sessionKey: LOTTERY_CURSOR_SESSION_KEY,
  });
  const [addLottery, { loading, error }] = useMutation<
    AddLotteryResult,
    AddLotteryVariables
  >(CREATE_LOTTERY_CAMPAIGN, {
    refetchQueries: [
      {
        query: QUERY_LOTTERY_CAMPAIGNS,
        variables: { limit: LOTTERY_PER_PAGE, cursor },
      },
    ],
    update: (cache, { data }) => {
      try {
        const newCampaign = data?.lotteryCampaignsAdd;

        if (!newCampaign) {
          return;
        }

        const existingData: any = cache.readQuery({
          query: QUERY_LOTTERY_CAMPAIGNS,
          variables: {
            limit: LOTTERY_PER_PAGE,
            cursor,
          },
        });

        if (!existingData?.lotteryCampaigns) {
          return;
        }

        cache.writeQuery({
          query: QUERY_LOTTERY_CAMPAIGNS,
          variables: {
            limit: LOTTERY_PER_PAGE,
            cursor,
          },
          data: {
            lotteryCampaigns: {
              ...existingData.lotteryCampaigns,
              list: [newCampaign, ...existingData.lotteryCampaigns.list],
              totalCount: (existingData.lotteryCampaigns.totalCount || 0) + 1,
            },
          },
        });
      } catch (e) {
        console.error('Cache update error:', e);
      }
    },
  });

  const lotteryAdd = async (
    options: MutationHookOptions<AddLotteryResult, AddLotteryVariables>,
  ) => {
    return addLottery({
      ...options,
      onCompleted: (data) => {
        toast({
          title: 'Success',
          description: 'Lottery campaign created successfully',
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
    lotteryAdd,
    loading,
    error,
  };
};
