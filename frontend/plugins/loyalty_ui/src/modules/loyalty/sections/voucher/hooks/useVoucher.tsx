import { useQuery } from '@apollo/client';
import queries from '../graphql/queries';
import {
  IVoucher,
  IVoucherCampaign,
  MainQueryResponse,
  VoucherCampaignQueryResponse,
} from '~/modules/loyalty/sections/voucher/types';

const ITEMS_PER_PAGE = 10;

interface UseVouchersResult {
  list: IVoucher[];
  loading: boolean;
  refetch: () => void;
  totalCount: number;
}
interface UseVouchersCampaignResult {
  list: IVoucherCampaign[];
  loading: boolean;
  refetch: () => void;
  fetchMore: () => void;
}
export function useVoucher(): UseVouchersResult {
  const { data, loading, fetchMore, refetch } = useQuery<MainQueryResponse>(
    queries.vouchersMain,
    {
      variables: {},
    },
  );

  const list = data?.vouchersMain?.list || [];
  const totalCount = data?.vouchersMain?.totalCount || 0;

  return {
    list,
    loading,
    refetch,
    totalCount,
  };
}
export function useVoucherCampaign(): UseVouchersCampaignResult {
  const { data, loading, fetchMore, refetch } =
    useQuery<VoucherCampaignQueryResponse>(queries.voucherCampaigns, {
      variables: {},
    });

  const list = data?.voucherCampaigns || [];

  return {
    list,
    loading,
    refetch: () => refetch(),
    fetchMore: () => fetchMore({ variables: {} }),
  };
}
