import { useQuery, WatchQueryFetchPolicy } from '@apollo/client';
import { STRUCTURE_ACCESS_SEATS } from '../graphql/structureAccessQueries';
import { IStructureAccessSeat } from '../types';

export const useStructureSeats = ({
  entityId,
  userId,
  skip,
  fetchPolicy = 'cache-and-network',
}: {
  entityId?: string;
  userId?: string;
  skip?: boolean;
  fetchPolicy?: WatchQueryFetchPolicy;
}) => {
  const { data, loading, error } = useQuery<
    { structureSeats: IStructureAccessSeat[] },
    { entityId?: string; userId?: string }
  >(STRUCTURE_ACCESS_SEATS, {
    variables: { entityId, userId },
    skip,
    fetchPolicy,
  });

  return {
    seats: data?.structureSeats ?? [],
    loading: loading && !data,
    error,
  };
};
