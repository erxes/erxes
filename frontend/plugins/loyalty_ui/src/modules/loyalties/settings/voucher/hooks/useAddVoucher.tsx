import { MutationHookOptions, useMutation } from '@apollo/client';
import { useRecordTableCursor, useToast } from 'erxes-ui';
import { VOUCHERS_CURSOR_SESSION_KEY } from '../constants/vouchersCursorSessionKey';
import { CREATE_VOUCHER_CAMPAIGN } from '../graphql/mutations/VoucherMutations';
import { QUERY_VOUCHER_CAMPAIGNS } from '../graphql/queries/getCampaignsQuery';
import { VOUCHERS_PER_PAGE } from './useVouchers';

export interface AddVoucherResult {
  voucherCampaignsAdd: any;
}

export interface AddVoucherVariables {
  title: string;
  description?: string;
  status?: string;

  startDate?: string;
  endDate?: string;

  buyScore?: number;
  score?: number;
  scoreAction?: string;

  voucherType?: string;

  productCategoryIds?: string[];
  productIds?: string[];
  discountPercent?: number;

  bonusProductId?: string;
  bonusCount?: number;

  coupon?: string;

  spinCampaignId?: string;
  spinCount?: number;

  lotteryCampaignId?: string;
  lotteryCount?: number;

  kind?: string;
  value?: number;

  restrictions?: any;
}

export const useAddVoucher = () => {
  const { toast } = useToast();
  const { cursor } = useRecordTableCursor({
    sessionKey: VOUCHERS_CURSOR_SESSION_KEY,
  });
  const [addVoucher, { loading, error }] = useMutation<
    AddVoucherResult,
    AddVoucherVariables
  >(CREATE_VOUCHER_CAMPAIGN, {
    refetchQueries: [
      {
        query: QUERY_VOUCHER_CAMPAIGNS,
        variables: { limit: VOUCHERS_PER_PAGE, cursor },
      },
    ],
    update: (cache, { data }) => {
      try {
        const newCampaign = data?.voucherCampaignsAdd;

        if (!newCampaign) {
          return;
        }

        const existingData: any = cache.readQuery({
          query: QUERY_VOUCHER_CAMPAIGNS,
          variables: { limit: VOUCHERS_PER_PAGE, cursor },
        });

        if (!existingData?.voucherCampaigns) {
          return;
        }

        cache.writeQuery({
          query: QUERY_VOUCHER_CAMPAIGNS,
          variables: { limit: VOUCHERS_PER_PAGE, cursor },
          data: {
            voucherCampaigns: {
              ...existingData.voucherCampaigns,
              list: [newCampaign, ...existingData.voucherCampaigns.list],
              totalCount: (existingData.voucherCampaigns.totalCount || 0) + 1,
            },
          },
        });
      } catch (e) {
        console.error('Cache update error:', e);
      }
    },
  });

  const voucherAdd = async (
    options: MutationHookOptions<AddVoucherResult, AddVoucherVariables>,
  ) => {
    return addVoucher({
      ...options,
      onCompleted: (data) => {
        toast({
          title: 'Success',
          description: 'Voucher campaign created successfully',
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
    voucherAdd,
    loading,
    error,
  };
};
