import { useMutation, MutationHookOptions } from '@apollo/client';
import { useRecordTableCursor, useToast } from 'erxes-ui';
import { addVoucherMutation } from '../graphql/mutations/VoucherMutations';
import { getCampaignsQuery } from '../graphql/queries/getCampaignsQuery';
import { VOUCHERS_CURSOR_SESSION_KEY } from '../constants/vouchersCursorSessionKey';
import { VOUCHERS_PER_PAGE } from './useVouchers';

export interface AddVoucherResult {
  createCampaign: any;
}

export interface AddVoucherVariables {
  name: string;
  kind: string;
  description?: string;
  status?: string;
  type?: string;
  startDate?: Date;
  endDate?: Date;
  conditions?: any;
  title?: string;
  buyScore?: number;
  count?: number;
  minimumSpend?: number;
  maximumSpend?: number;
  productCategory?: string;
  orExcludeProductCategory?: string;
  product?: string;
  orExcludeProduct?: string;
  tag?: string;
  orExcludeTag?: string;
  bonusProductId?: string;
  bonusCount?: number;
  lottery?: string;
  lotteryCount?: number;
  spinCount?: number;
  spinCampaignId?: string;
}

export const useAddVoucher = () => {
  const { toast } = useToast();
  const { cursor } = useRecordTableCursor({
    sessionKey: VOUCHERS_CURSOR_SESSION_KEY,
  });
  const [addVoucher, { loading, error }] = useMutation<
    AddVoucherResult,
    AddVoucherVariables
  >(addVoucherMutation, {
    refetchQueries: [
      {
        query: getCampaignsQuery,
        variables: { kind: 'voucher', limit: VOUCHERS_PER_PAGE, cursor },
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
          variables: { kind: 'voucher', limit: VOUCHERS_PER_PAGE, cursor },
        });

        if (!existingData?.getCampaigns) {
          return;
        }

        cache.writeQuery({
          query: getCampaignsQuery,
          variables: { kind: 'voucher', limit: VOUCHERS_PER_PAGE, cursor },
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
