import { useQuery } from '@apollo/client';
import { useQueryState } from 'erxes-ui';
import { GET_TECH_CARD_DETAIL } from '../graphql/techCardQueries';
import { ITechCard } from '../types/TechCard';

export const useTechCardDetail = () => {
  const [techCardId, setTechCardId] = useQueryState<string>('tech_card_id');
  const { data, loading } = useQuery<{ techCardDetail: ITechCard }>(
    GET_TECH_CARD_DETAIL,
    {
      variables: { _id: techCardId },
      skip: !techCardId,
    },
  );

  return {
    techCardDetail: data?.techCardDetail,
    loading,
    closeDetail: () => setTechCardId(null),
  };
};
