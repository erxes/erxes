import { useQuery } from '@apollo/client';
import { useQueryState } from 'erxes-ui';
import { QUERY_VOUCHER_CAMPAIGN } from '../../graphql/queries/getCampaignQuery';

export const useVoucherDetailWithQuery = () => {
  const [editVoucherId] = useQueryState<string>('editVoucherId');

  const { data, loading, error } = useQuery(QUERY_VOUCHER_CAMPAIGN, {
    variables: {
      _id: editVoucherId || '',
    },
    skip: !editVoucherId,
  });

  return {
    voucherDetail: data?.voucherCampaignDetail ?? undefined,
    loading,
    error,
  };
};
