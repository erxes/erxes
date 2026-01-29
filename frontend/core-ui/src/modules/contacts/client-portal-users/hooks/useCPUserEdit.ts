import { useMutation } from '@apollo/client';
import { CP_USERS_EDIT } from '@/contacts/client-portal-users/graphql/cpUsersEdit';
import { GET_CLIENT_PORTAL_USER } from '@/contacts/client-portal-users/graphql/getClientPortalUser';
import { GET_CLIENT_PORTAL_USERS } from '@/contacts/client-portal-users/graphql/getClientPortalUsers';
import { useQueryState } from 'erxes-ui';

type CPUserEditVariables = {
  _id: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  username?: string;
  companyName?: string;
  companyRegistrationNumber?: string;
};

export function useCPUserEdit() {
  const [_id] = useQueryState<string>('cpUserId');

  const [cpUsersEditMutation] = useMutation(CP_USERS_EDIT, {
    refetchQueries: [
      { query: GET_CLIENT_PORTAL_USER, variables: { _id: _id ?? '' } },
      { query: GET_CLIENT_PORTAL_USERS },
    ],
  });

  const cpUserEdit = (options: { variables: CPUserEditVariables }) => {
    return cpUsersEditMutation({
      variables: options.variables,
    });
  };

  return { cpUserEdit };
}
