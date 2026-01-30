import { useQuery } from '@apollo/client';
import { IDonation } from '../../types/donationTypes';
import { useQueryState } from 'erxes-ui';
import { getCampaignQuery } from '../../../voucher/graphql/queries/getCampaignQuery';

export const useDonationDetailWithQuery = () => {
  const [editDonationId] = useQueryState('editDonationId');

  const { data, loading, error } = useQuery(getCampaignQuery, {
    variables: {
      id: editDonationId || '',
    },
    skip: !editDonationId,
  });

  return {
    donationDetail: data?.getCampaign as IDonation,
    loading,
    error,
  };
};
