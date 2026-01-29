import { QueryHookOptions, useQuery } from '@apollo/client';
import { useQueryState } from 'erxes-ui';
import { GET_CLIENT_PORTAL_USER } from '@/contacts/client-portal-users/graphql/getClientPortalUser';
import { ICPUser } from '@/contacts/client-portal-users/types/cpUser';

export const useClientPortalUser = (
  options?: QueryHookOptions<{ getClientPortalUser: ICPUser }>,
) => {
  const [_id] = useQueryState<string>('cpUserId');

  const { data, loading, error } = useQuery<{
    getClientPortalUser: ICPUser;
  }>(GET_CLIENT_PORTAL_USER, {
    ...options,
    variables: { _id: _id ?? '' },
    skip: !_id,
  });

  return {
    cpUser: data?.getClientPortalUser,
    loading,
    error,
  };
};
