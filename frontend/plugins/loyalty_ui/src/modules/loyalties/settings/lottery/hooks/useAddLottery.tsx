import { useMutation, MutationHookOptions } from '@apollo/client';
import { useRecordTableCursor, useToast } from 'erxes-ui';
import { addLotteryMutation } from '../graphql/mutations/LotteryMutations';
import { getCampaignsQuery } from '../add-lottery-campaign/graphql/queries/getCampaignsQuery';
import { LOTTERY_CURSOR_SESSION_KEY } from '../constants/lotteryCursorSessionKey';
import { LOTTERY_PER_PAGE } from './useLotteries';

export interface AddLotteryResult {
  createCampaign: any;
}

export interface AddLotteryVariables {
  name: string;
  kind: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  title?: string;
  conditions?: {
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
  >(addLotteryMutation, {
    refetchQueries: [
      {
        query: getCampaignsQuery,
        variables: { kind: 'lottery', limit: LOTTERY_PER_PAGE, cursor },
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
            kind: 'lottery',
            limit: LOTTERY_PER_PAGE,
            cursor,
          },
        });

        if (!existingData?.getCampaigns) {
          return;
        }

        cache.writeQuery({
          query: getCampaignsQuery,
          variables: {
            kind: 'lottery',
            limit: LOTTERY_PER_PAGE,
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
