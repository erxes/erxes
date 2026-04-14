import { useQuery } from '@apollo/client';
import { CMS_CUSTOM_POST_TYPES } from '../graphql/queries';
import { ICustomPostType } from '../types/customTypeTypes';

interface UseCustomTypesProps {
  clientPortalId?: string;
}

interface UseCustomTypesResult {
  customTypes: ICustomPostType[];
  loading: boolean;
  error?: any;
  refetch: () => void;
}

export function useCustomTypes({
  clientPortalId,
}: UseCustomTypesProps): UseCustomTypesResult {
  const { data, loading, error, refetch } = useQuery(CMS_CUSTOM_POST_TYPES, {
    variables: { clientPortalId },
    skip: !clientPortalId,
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
