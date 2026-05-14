import { useQuery } from '@apollo/client';
import { POS_COVER_DETAIL_QUERY } from '../graphql/queries/posCoverDetailQuery';
import { ICovers } from '../../types/posCover';

export const usePosCoversQuery = (id?: string) => {
  const { data, loading, error, refetch } = useQuery<{
    posCoverDetail: ICovers;
  }>(POS_COVER_DETAIL_QUERY, {
    variables: { id },
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
