import { OperationVariables, useMutation, useQuery } from '@apollo/client';

import { currentUserState } from 'ui-modules';
import { toast, useConfirm } from 'erxes-ui';
import { useAtom } from 'jotai';
import { UPDATE_PROFILE } from '@/settings/profile/graphql/mutations/updateProfile';
import { GET_USER_DETAIL } from '@/settings/profile/graphql/queries/userDetail';

import { IUsersDetail } from '@/settings/profile/types/userDetail';

const useProfile = (options?: OperationVariables) => {
  const [currentUser, setCurrentUser] = useAtom(currentUserState);

  const { confirm } = useConfirm();

  const { loading, data, refetch } = useQuery(GET_USER_DETAIL, {
    variables: { _id: currentUser?._id },
    ...options,
    skip: !currentUser?._id,
  });

  const [updateProfile, { loading: updating }] = useMutation(UPDATE_PROFILE);

  const profileUpdate = async (profile: Partial<IUsersDetail>) => {
    const confirmOptions = { confirmationValue: 'update' };

    confirm({
      message: 'Are you sure you want to update the profile?',
      options: confirmOptions,
    }).then(async () => {
      try {
        const response = await updateProfile({ variables: { ...profile } });

        if (response.data) {
          refetch();
          setCurrentUser(response.data.usersEditProfile);

          toast({ title: 'Successfully updated profile' });
        }
      } catch (e: any) {
        toast({
          title: 'Error updating profile',
          description: e.message || 'An unexpected error occurred.',
        });
      }
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
