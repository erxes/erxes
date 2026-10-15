import { useMutation } from '@apollo/client';
import { useRecordTableCursor } from 'erxes-ui';
import { DONATIONS_CURSOR_SESSION_KEY } from '../constants/donationsCursorSessionKey';
import { REMOVE_DONATE_CAMPAIGN } from '../graphql/mutations/removeDonationMutations';
import { QUERY_DONATE_CAMPAIGNS } from '../add-donation-campaign/graphql/queries/getCampaignsQuery';
import { DONATIONS_PER_PAGE } from './useDonations';

export const useDeleteDonation = () => {
  const { cursor } = useRecordTableCursor({
    sessionKey: DONATIONS_CURSOR_SESSION_KEY,
  });

  const [removeDonation, { loading }] = useMutation(REMOVE_DONATE_CAMPAIGN, {
    refetchQueries: [
      {
        query: QUERY_DONATE_CAMPAIGNS,
        variables: {
          limit: DONATIONS_PER_PAGE,
          cursor,
        },
      },
    ],
    awaitRefetchQueries: true,
  });

  return {
    removeDonation,
    loading,
  };
};
