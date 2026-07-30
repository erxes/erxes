import {
  MutationHookOptions,
  OperationVariables,
  useMutation,
  useQuery,
} from '@apollo/client';
import { toast, useConfirm } from 'erxes-ui';

import { GET_USER_DETAIL } from '@/settings/profile/graphql/queries/userDetail';
import { UPDATE_PROFILE } from '@/settings/profile/graphql/mutations/updateProfile';
import { currentUserState } from 'ui-modules';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

const useProfile = (options?: OperationVariables) => {
  const [currentUser, setCurrentUser] = useAtom(currentUserState);
  const { t } = useTranslation('settings', { keyPrefix: 'profile' });

  const { confirm } = useConfirm();

  const { loading, data } = useQuery(GET_USER_DETAIL, {
    variables: { _id: currentUser?._id },
    ...options,
    skip: !currentUser?._id,
  });

  const [updateProfile, { loading: updating }] = useMutation(UPDATE_PROFILE);

  const profileUpdate = ({ variables, ...options }: MutationHookOptions) => {
    const confirmOptions = { confirmationValue: 'update' };

    confirm({
      message: t(
        'confirm-update-profile',
        'Are you sure you want to update the profile?',
      ),
      options: confirmOptions,
    }).then(() => {
      updateProfile({
        ...options,
        variables,
        update: (cache, { data: { usersEditProfile } }) => {
          cache.modify({
            id: cache.identify(usersEditProfile),
            fields: Object.keys(profile || {}).reduce((fields: any, field) => {
              fields[field] = () => (profile || {})[field];
              return fields;
            }, {}),
            optimistic: true,
          });
        },
        onCompleted: ({ usersEditProfile }) => {
          setCurrentUser((prev) => ({
            ...prev,
            ...usersEditProfile,
          }));

          toast({
            title: t(
              'profile-updated-successfully',
              'Successfully updated profile',
            ),
            variant: 'success',
          });
        },
        onError: (error) => {
          toast({
            title: t('error-updating-profile', 'Error updating profile'),
            description:
              error.message ||
              t('unexpected-error', 'An unexpected error occurred.'),
            variant: 'destructive',
          });
        },
      });
    });
  };

  const profile = data?.userDetail || {};

  return {
    profile,
    loading,
    profileUpdate,
    updating,
  };
};

export { useProfile };
