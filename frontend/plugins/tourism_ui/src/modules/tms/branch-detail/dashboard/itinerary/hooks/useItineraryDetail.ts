import { useQuery } from '@apollo/client';
import { GET_ITINERARY_DETAIL } from '../graphql/queries';

export type { IItineraryDetail } from '../types/itinerary';

export const useItineraryDetail = (
  id?: string | null,
  enabled = true,
  language?: string,
) => {
  const { data, loading, error, refetch } = useQuery(GET_ITINERARY_DETAIL, {
    variables: id ? { id, language } : undefined,
    skip: !id || !enabled,
    fetchPolicy: 'cache-and-network',
  });

  return {
    itinerary: data?.bmsItineraryDetail,
    loading,
    error,
    refetch,
  };
};
