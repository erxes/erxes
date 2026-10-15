import { useMutation } from '@apollo/client';
import { UPDATE_VOUCHER_CAMPAIGN } from '../../graphql/mutations/voucherEditStatusMutations';
import { QUERY_VOUCHER_CAMPAIGNS } from '../../graphql/queries/getCampaignsQuery';

export const useVoucherEdit = () => {
  const [updateCampaign, { loading, error }] = useMutation(
    UPDATE_VOUCHER_CAMPAIGN,
    {
      refetchQueries: [QUERY_VOUCHER_CAMPAIGNS],
    },
  );

  return {
    voucherEdit: updateCampaign,
    loading,
    error,
  };
};
