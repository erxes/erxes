import { useQuery } from '@apollo/client';
import { SALES_SCORE_CAMPAIGN_OPTIONS } from '../graphql/loyaltyRulesQueries';

type TScoreCampaignOption = { _id: string; title: string; status?: string };

const ACTIVE = 'active';

export const useScoreCampaignTitles = () => {
  const { data, loading, refetch } = useQuery<{
    scoreCampaigns?: { list?: TScoreCampaignOption[] };
  }>(SALES_SCORE_CAMPAIGN_OPTIONS, { fetchPolicy: 'cache-and-network' });
  const campaigns = data?.scoreCampaigns?.list || [];
  const find = (id?: string | null) => campaigns.find(({ _id }) => _id === id);

  return {
    campaigns,
    loading,
    // A campaign made from loyalty's picker is not in this list yet.
    refetch: () => refetch(),
    titleOf: (id?: string | null) => find(id)?.title || '',
    // Unknown until loaded: no warning rather than a false one.
    inactive: (id?: string | null) => {
      const campaign = find(id);

      return !!campaign && campaign.status !== ACTIVE;
    },
  };
};
