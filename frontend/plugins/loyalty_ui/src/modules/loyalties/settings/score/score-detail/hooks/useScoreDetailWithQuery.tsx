import { useQuery } from '@apollo/client';
import { useQueryState } from 'erxes-ui';
import { QUERY_SCORE_CAMPAIGN_DETAIL } from '../../graphql/queries/getScoreCampaignDetailQuery';

export const useScoreDetailWithQuery = () => {
  const [editScoreId] = useQueryState('editScoreId');

  const { data, loading, error } = useQuery(QUERY_SCORE_CAMPAIGN_DETAIL, {
    variables: {
      _id: editScoreId || '',
    },
    skip: !editScoreId,
  });

  return {
    scoreDetail: data?.scoreCampaign,
    loading,
    error,
  };
};
