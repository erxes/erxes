import { useQuery } from '@apollo/client';
import { useQueryState } from 'erxes-ui';
import { QUERY_DONATE_CAMPAIGN } from '../../graphql/queries/getCampaignQuery';
import { IDonation } from '../../types/donationTypes';

export const useDonationDetailWithQuery = () => {
  const [editDonationId] = useQueryState('editDonationId');

  const { data, loading, error } = useQuery(QUERY_DONATE_CAMPAIGN, {
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
