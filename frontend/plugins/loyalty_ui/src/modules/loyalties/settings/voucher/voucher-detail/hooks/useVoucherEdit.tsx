import { useMutation } from '@apollo/client';
import { editVoucherStatusMutation } from '../../graphql/mutations/voucherEditStatusMutations';

const VOUCHER_EDIT = editVoucherStatusMutation;

export const useVoucherEdit = () => {
  const [updateCampaign, { loading, error }] = useMutation(VOUCHER_EDIT, {
    refetchQueries: ['getCampaignsQuery'],
  });

  return {
    voucherEdit: updateCampaign,
    loading,
    error,
  };
};
