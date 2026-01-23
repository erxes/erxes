import { useMutation, MutationHookOptions } from '@apollo/client';
import { useRecordTableCursor, useToast } from 'erxes-ui';
import { addSpinMutation } from '../graphql/mutations/SpinMutations';
import { getCampaignsQuery } from '../add-spin-campaign/graphql/queries/getCampaignsQuery';
import { SPINS_CURSOR_SESSION_KEY } from '../constants/spinsCursorSessionKey';
import { SPINS_PER_PAGE } from './useSpins';

export interface AddSpinResult {
  createCampaign: any;
}

export interface AddSpinVariables {
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

export const useAddSpin = () => {
  const { toast } = useToast();
  const { cursor } = useRecordTableCursor({
    sessionKey: SPINS_CURSOR_SESSION_KEY,
  });
  const [addSpin, { loading, error }] = useMutation<
    AddSpinResult,
    AddSpinVariables
  >(addSpinMutation, {
    refetchQueries: [
      {
        query: getCampaignsQuery,
        variables: { kind: 'spin', limit: SPINS_PER_PAGE, cursor },
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
            kind: 'spin',
            limit: SPINS_PER_PAGE,
            cursor,
          },
        });

        if (!existingData?.getCampaigns) {
          return;
        }

        cache.writeQuery({
          query: getCampaignsQuery,
          variables: {
            kind: 'spin',
            limit: SPINS_PER_PAGE,
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
