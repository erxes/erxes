import { useQuery, WatchQueryFetchPolicy } from '@apollo/client';
import { STRUCTURE_ACCESS_MEMBERS } from '../graphql/structureAccessQueries';
import { IStructureAccessMember } from '../types';

export const useStructureAccessMembers = ({
  entityId,
  userId,
  includeEnded,
  skip,
  fetchPolicy = 'cache-and-network',
}: {
  entityId?: string;
  userId?: string;
  includeEnded?: boolean;
  skip?: boolean;
  fetchPolicy?: WatchQueryFetchPolicy;
}) => {
  const { data, loading, error } = useQuery<{
    structureEntityMembers: IStructureAccessMember[];
  }>(STRUCTURE_ACCESS_MEMBERS, {
    variables: { entityId, userId, includeEnded },
    skip: skip || (!entityId && !userId),
    fetchPolicy,
  });

  return {
    members: data?.structureEntityMembers ?? [],
    loading,
    error,
  };
};
