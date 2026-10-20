import { useQuery } from '@apollo/client';
import { useSearchParams } from 'react-router-dom';
import { POS_COVER_DETAIL_QUERY } from '../graphql/queries/posCoverDetailQuery';

export const usePosCoverDetail = () => {
  const [searchParams] = useSearchParams();
  const coverId = searchParams.get('cover_id');

  const { data, loading, error } = useQuery(POS_COVER_DETAIL_QUERY, {
    variables: coverId ? { id: coverId } : undefined,
    skip: !coverId,
  });

  if (error) {
    console.error('Error fetching cover:', error);
  }

  return {
    cover: data?.posCoverDetail,
    loading,
    error,
  };
};
