import { QueryHookOptions, useQuery } from '@apollo/client';
import { useQueryState } from 'erxes-ui';
import { GET_CLIENT_PORTAL_USER } from '@/contacts/client-portal-users/graphql/getClientPortalUser';
import { ICPUser } from '@/contacts/client-portal-users/types/cpUser';
import { useCPUserPanelId } from '@/contacts/client-portal-users/contexts/CPUserPanelIdContext';

export const useClientPortalUser = (
  options?: QueryHookOptions<{ getClientPortalUser: ICPUser }>,
) => {
  const [_id] = useQueryState<string>('cpUserId');
  const panelId = useCPUserPanelId();
  const userId = panelId ?? _id;

  const { data, loading, error, refetch } = useQuery<{
    getClientPortalUser: ICPUser;
  }>(GET_CLIENT_PORTAL_USER, {
    ...options,
    variables: { ...options?.variables, _id: userId ?? '' },
    skip: !userId || options?.skip,
  });

  return {
    cpUser: data?.getClientPortalUser,
    loading,
    error,
    refetch,
  };
};
