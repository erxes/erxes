import { MutationHookOptions, useMutation } from '@apollo/client';
import { useRecordTableCursor, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { QUERY_SPIN_CAMPAIGNS } from '../add-spin-campaign/graphql/queries/getCampaignsQuery';
import { SPINS_CURSOR_SESSION_KEY } from '../constants/spinsCursorSessionKey';
import { CREATE_SPIN_CAMPAIGN } from '../graphql/mutations/SpinMutations';
import { ISpin } from '../types/spinTypes';
import { SPINS_PER_PAGE } from './useSpins';

interface SpinCampaignsQueryData {
  spinCampaigns: { list: ISpin[]; totalCount: number };
}

export interface AddSpinResult {
  spinCampaignsAdd: ISpin;
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
    probability?: number;
  }>;
}

export const useAddSpin = () => {
  const { t } = useTranslation('loyalty');
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

        const existingData = cache.readQuery<SpinCampaignsQueryData>({
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
          title: t('success'),
          description: t('spin-campaign-created'),
          variant: 'default',
        });
        options?.onCompleted?.(data);
      },
      onError: (error) => {
        toast({
          title: t('error'),
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
