import { useQuery } from '@apollo/client';
import { POS_COVER_DETAIL_QUERY } from '../graphql/queries/posCoverDetailQuery';

export const usePosCoversQuery = (id?: string) => {
  const { data, loading, error, refetch } = useQuery(POS_COVER_DETAIL_QUERY, {
    variables: id ? { id } : undefined,
    skip: !id,
    fetchPolicy: 'cache-and-network',
  });

  return {
    posCovers: data?.posCoverDetail,
    loading,
    error,
    refetch,
  };
};
