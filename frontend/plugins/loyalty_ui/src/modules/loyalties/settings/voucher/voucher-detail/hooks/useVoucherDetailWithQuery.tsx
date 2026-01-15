import { useQuery } from '@apollo/client';
import { IVoucher } from '../../types/voucherTypes';
import { useQueryState } from 'erxes-ui';
import { getCampaignQuery } from '../../graphql/queries/getCampaignQuery';

export const useVoucherDetailWithQuery = () => {
  const [editVoucherId] = useQueryState('editVoucherId');

  const { data, loading, error } = useQuery(getCampaignQuery, {
    variables: {
      id: editVoucherId || '',
    },
    skip: !editVoucherId,
  });

  return {
    voucherDetail: data?.getCampaign as IVoucher,
    loading,
    error,
  };
};
