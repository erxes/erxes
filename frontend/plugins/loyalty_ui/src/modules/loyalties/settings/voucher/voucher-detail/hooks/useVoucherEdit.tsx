import { useMutation } from '@apollo/client';
import { UPDATE_VOUCHER_CAMPAIGN } from '../../graphql/mutations/voucherEditStatusMutations';

export const useVoucherEdit = () => {
  const [updateCampaign, { loading, error }] = useMutation(
    UPDATE_VOUCHER_CAMPAIGN,
    {
      refetchQueries: ['getCampaignsQuery'],
    },
  );

  return {
    voucherEdit: updateCampaign,
    loading,
    error,
  };
};
