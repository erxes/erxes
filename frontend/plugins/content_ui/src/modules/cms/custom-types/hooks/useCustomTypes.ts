import { ApolloError, useQuery } from '@apollo/client';
import { CMS_CUSTOM_POST_TYPES } from '../graphql/queries';
import { ICustomPostType } from '../types/customTypeTypes';

interface UseCustomTypesProps {
  clientPortalId?: string;
  skip?: boolean;
}

interface UseCustomTypesResult {
  customTypes: ICustomPostType[];
  loading: boolean;
  error?: ApolloError;
  refetch: () => void;
}

export function useCustomTypes({
  clientPortalId,
  skip = false,
}: UseCustomTypesProps): UseCustomTypesResult {
  const { data, loading, error, refetch } = useQuery(CMS_CUSTOM_POST_TYPES, {
    variables: { clientPortalId },
    skip: !clientPortalId || skip,
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });

  const customTypes = data?.cmsCustomPostTypes || [];

  return {
    customTypes,
    loading,
    error,
    refetch,
  };
}
