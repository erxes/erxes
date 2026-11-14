import { useQuery } from '@apollo/client';
import { QUERY_SCORE_CAMPAIGN_DETAIL } from '@/loyalties/settings/score/graphql/queries/getScoreCampaignDetailQuery';

/** The chosen campaign's title for a tile header; none for "all campaigns". */
export const useScoreCampaignTitle = (campaignId?: string) => {
  const { data } = useQuery<{ scoreCampaign?: { title?: string } | null }>(
    QUERY_SCORE_CAMPAIGN_DETAIL,
    { variables: { _id: campaignId }, skip: !campaignId },
  );

  return data?.scoreCampaign?.title;
};
