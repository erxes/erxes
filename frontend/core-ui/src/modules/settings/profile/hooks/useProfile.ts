import { useTranslation } from 'react-i18next';
import {
  MutationFunctionOptions,
  QueryHookOptions,
  useMutation,
  useQuery,
} from '@apollo/client';
import { toast, useConfirm } from 'erxes-ui';

import { GET_USER_DETAIL } from '@/settings/profile/graphql/queries/userDetail';
import { UPDATE_PROFILE } from '@/settings/profile/graphql/mutations/updateProfile';
import { currentUserState, IUser } from 'ui-modules';
import { useAtom } from 'jotai';
import type { FormType } from './useProfileForm';

type Profile = IUser & {
  details?: IUser['details'] & FormType['details'];
  links?: FormType['links'];
  positionIds?: string[];
};

const useProfile = (
  options?: QueryHookOptions<{ userDetail: Profile }, { _id?: string }>,
) => {
  const [currentUser, setCurrentUser] = useAtom(currentUserState);

  const { confirm } = useConfirm();
  const { t } = useTranslation('settings', { keyPrefix: 'profile' });

  const { loading, data } = useQuery<{ userDetail: Profile }, { _id?: string }>(
    GET_USER_DETAIL,
    {
      variables: { _id: currentUser?._id },
      ...options,
      skip: !currentUser?._id,
    },
  );

  const [updateProfile, { loading: updating }] = useMutation<
    { usersEditProfile: Profile },
    FormType
  >(UPDATE_PROFILE);

  const profileUpdate = ({
    variables,
    ...options
  }: MutationFunctionOptions<{ usersEditProfile: Profile }, FormType>) => {
    const confirmOptions = { confirmationValue: 'update' };

    return confirm({
      message: t('confirm-update-profile'),
      options: confirmOptions,
    })
      .then(() => {
        return updateProfile({
          ...options,
          variables,
          onCompleted: ({ usersEditProfile }) => {
            setCurrentUser(
              (prev) =>
                prev && {
                  ...prev,
                  ...usersEditProfile,
                },
            );

            toast({
              title: t('profile-updated-successfully'),
              variant: 'success',
            });
          },
          onError: (error) => {
            toast({
              title: t('error-updating-profile'),
              description: error.message || t('unexpected-error'),
              variant: 'destructive',
            });
          },
        });
      })
      .catch(() => undefined);
  };

  const profile = data?.userDetail;

  return {
    profile,
    loading,
    profileUpdate,
    updating,
  };
};

export { useProfile };
