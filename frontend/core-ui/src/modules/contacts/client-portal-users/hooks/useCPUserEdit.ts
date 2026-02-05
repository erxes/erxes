import { useMutation } from '@apollo/client';
import { CP_USERS_EDIT } from '@/contacts/client-portal-users/graphql/cpUsersEdit';
import { GET_CLIENT_PORTAL_USER } from '@/contacts/client-portal-users/graphql/getClientPortalUser';
import { useQueryState, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

type CPUserEditVariables = {
  _id: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  username?: string;
  companyName?: string;
  companyRegistrationNumber?: string;
};

interface CPUserEditOptions {
  variables: CPUserEditVariables;
  onError?: (error: Error) => void;
  onCompleted?: (data: unknown) => void;
}

export function useCPUserEdit() {
  const [_id] = useQueryState<string>('cpUserId');
  const { toast } = useToast();
  const { t } = useTranslation('contact');

  const [cpUsersEditMutation] = useMutation(CP_USERS_EDIT, {
    refetchQueries: [
      { query: GET_CLIENT_PORTAL_USER, variables: { _id: _id ?? '' } },
      'getClientPortalUsers',
    ],
  });

  const cpUserEdit = (options: CPUserEditOptions) => {
    return cpUsersEditMutation({
      variables: options.variables,
      onError: (error) => {
        toast({
          title: t('error', { defaultValue: 'Error' }),
          description: error.message,
          variant: 'destructive',
        });
        options.onError?.(error);
      },
      onCompleted: (data) => {
        toast({
          title: t('success', { defaultValue: 'Success' }),
          description: t('clientPortalUser.edit.success', {
            defaultValue: 'User updated',
          }),
          variant: 'success',
        });
        options.onCompleted?.(data);
      },
    });
  };

  return { cpUserEdit };
}
