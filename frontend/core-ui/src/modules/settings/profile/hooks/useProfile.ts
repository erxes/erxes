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

const useProfile = (options?: OperationVariables) => {
  const [currentUser, setCurrentUser] = useAtom(currentUserState);

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
      message: 'Are you sure you want to update the profile?',
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
            title: 'Successfully updated profile',
            variant: 'success',
          });
        },
        onError: (error) => {
          toast({
            title: 'Error updating profile',
            description: error.message || 'An unexpected error occurred.',
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
